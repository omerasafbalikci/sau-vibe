import os
import asyncio
import sqlite3
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from typing import List
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_classic.chains.retrieval_qa.base import RetrievalQA
from langchain_core.prompts import PromptTemplate
from langchain_core.embeddings import Embeddings
from langchain_classic.chains import ConversationalRetrievalChain
from langchain_classic.memory import ConversationBufferMemory
from langchain_classic.callbacks import AsyncIteratorCallbackHandler
from langchain_classic.schema import HumanMessage, AIMessage, SystemMessage

load_dotenv()


# ── Hafif TF-IDF Embeddings — torch yok, dış API yok, RAM minimal ──
class TFIDFEmbeddings(Embeddings):
    """scikit-learn TF-IDF tabanlı embedding — Render free tier için optimize."""

    def __init__(self, max_features: int = 1024):
        self.vectorizer = TfidfVectorizer(
            max_features=max_features,
            analyzer="char_wb",   # karakter n-gramları Türkçe için daha iyi
            ngram_range=(2, 4),
            sublinear_tf=True,
        )
        self.fitted = False

    def _normalize(self, matrix):
        norms = np.linalg.norm(matrix, axis=1, keepdims=True)
        norms[norms == 0] = 1.0
        return matrix / norms

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        if not self.fitted:
            self.vectorizer.fit(texts)
            self.fitted = True
        matrix = self._normalize(self.vectorizer.transform(texts).toarray())
        return matrix.tolist()

    def embed_query(self, text: str) -> List[float]:
        if not self.fitted:
            # Henüz fit edilmemişse tek metin üzerinden fit et
            self.vectorizer.fit([text])
            self.fitted = True
        vec = self._normalize(self.vectorizer.transform([text]).toarray())[0]
        return vec.tolist()


# --- 1. FASTAPI VE CORS AYARLARI ---
app = FastAPI(title="Sakarya Kampüs Asistanı SaaS API", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_FILE = "campus_history.db"
vector_store = None


# --- 2. SQLITE VERİTABANI YÖNETİMİ ---
def veritabanini_ilklendir():
    with sqlite3.connect(DB_FILE) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                session_id TEXT PRIMARY KEY,
                title TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT,
                role TEXT,
                content TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
            )
        """)
        conn.commit()


def veritabanini_hazirla():
    embeddings = TFIDFEmbeddings(max_features=1024)
    # Her zaman yeniden oluştur — Render'da disk kalıcı değil
    print("Vektör Veritabanı oluşturuluyor...")
    loader = PyPDFDirectoryLoader("data")
    docs = loader.load()
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=600, chunk_overlap=150)
    chunks = text_splitter.split_documents(docs)
    # Önce tüm metinler üzerinde fit et
    all_texts = [c.page_content for c in chunks]
    embeddings.vectorizer.fit(all_texts)
    embeddings.fitted = True
    v_store = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory="chroma_db"
    )
    print(f"Vektör Veritabanı oluşturuldu! ({len(chunks)} chunk)")
    return v_store


@app.on_event("startup")
async def startup_event():
    global vector_store
    veritabanini_ilklendir()
    vector_store = veritabanini_hazirla()
    print("🚀 Akıllı Hafızalı Sunucu Başarıyla Ayağa Kalktı!")


# --- 3. PYDANTIC MODELLERİ ---
class SoruIstegi(BaseModel):
    session_id: str
    soru: str


# --- 4. API UÇ NOKTALARI ---

@app.post("/chat")
async def chat_endpoint(istek: SoruIstegi):
    hafiza = ConversationBufferMemory(memory_key="chat_history", return_messages=True, output_key="answer")

    with sqlite3.connect(DB_FILE) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT role, content FROM messages WHERE session_id = ? ORDER BY id ASC", (istek.session_id,))
        for role, content in cursor.fetchall():
            if role == "user":
                hafiza.chat_memory.add_user_message(content)
            elif role == "ai":
                hafiza.chat_memory.add_ai_message(content)

    callback = AsyncIteratorCallbackHandler()
    sessiz_llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.1)
    asistan_llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        temperature=0.1,
        streaming=True,
        callbacks=[callback]
    )

    prompt_sablari = """
    Sen Sakarya Üniversitesi Bilgisayar ve Bilişim Bilimleri Fakültesi öğrencileri için hazırlanmış Kampüs Asistanısın.
    Aşağıdaki metinleri kullanarak soruyu cevapla. Yönetmelikteki oranları, şartları ve rakamları KESİNLİKLE atlama.

    ÇOK ÖNEMLİ KURAL: Eğer sorunun cevabı aşağıdaki metinlerde KESİNLİKLE YOKSA, hiçbir şey uydurma ve sadece şu cümleyi söyle:
    "Bu konuda yönergelerde net bir bilgi bulamadım. Lütfen detaylı bilgi için Fakülte Öğrenci İşleri ile iletişime geçiniz: https://bf.sakarya.edu.tr/tr/2931/iletisim"

    Metinler:
    {context}

    Soru: {question}
    Cevap:"""
    ozel_prompt = PromptTemplate(template=prompt_sablari, input_variables=["context", "question"])

    qa_chain = ConversationalRetrievalChain.from_llm(
        llm=asistan_llm,
        condense_question_llm=sessiz_llm,
        retriever=vector_store.as_retriever(search_kwargs={"k": 10}),
        memory=hafiza,
        combine_docs_chain_kwargs={"prompt": ozel_prompt}
    )

    async def stream_generator():
        task = asyncio.create_task(qa_chain.ainvoke({"question": istek.soru}))
        tam_cevap = ""
        async for token in callback.aiter():
            yield token
            tam_cevap += token
        await task

        with sqlite3.connect(DB_FILE) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT session_id FROM sessions WHERE session_id = ?", (istek.session_id,))
            if not cursor.fetchone():
                baslik = istek.soru if len(istek.soru) <= 30 else istek.soru[:30] + "..."
                cursor.execute("INSERT INTO sessions (session_id, title) VALUES (?, ?)", (istek.session_id, baslik))
            cursor.execute("INSERT INTO messages (session_id, role, content) VALUES (?, 'user', ?)", (istek.session_id, istek.soru))
            cursor.execute("INSERT INTO messages (session_id, role, content) VALUES (?, 'ai', ?)", (istek.session_id, tam_cevap))
            conn.commit()

    return StreamingResponse(stream_generator(), media_type="text/plain")


@app.get("/sessions")
async def get_sessions():
    with sqlite3.connect(DB_FILE) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT session_id, title, created_at FROM sessions ORDER BY created_at DESC")
        return [dict(row) for row in cursor.fetchall()]


@app.get("/sessions/{session_id}")
async def get_session_history(session_id: str):
    with sqlite3.connect(DB_FILE) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT role, content, timestamp FROM messages WHERE session_id = ? ORDER BY id ASC", (session_id,))
        rows = cursor.fetchall()
        return [dict(row) for row in rows] if rows else []


@app.post("/general-chat")
async def general_chat_endpoint(istek: SoruIstegi):
    """PDF'lere bakmayan, genel amaçlı Gemini sohbet endpoint'i."""
    mesajlar = [SystemMessage(
        content="Sen kullanıcılara her türlü genel konuda yardımcı olan, samimi, kibar ve zeki bir yapay zeka asistanısın."
    )]

    with sqlite3.connect(DB_FILE) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT role, content FROM messages WHERE session_id = ? ORDER BY id ASC", (istek.session_id,))
        for role, content in cursor.fetchall():
            if role == "user":
                mesajlar.append(HumanMessage(content=content))
            elif role == "ai":
                mesajlar.append(AIMessage(content=content))

    mesajlar.append(HumanMessage(content=istek.soru))
    genel_llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.7)

    async def stream_generator():
        tam_cevap = ""
        async for chunk in genel_llm.astream(mesajlar):
            if chunk.content:
                yield chunk.content
                tam_cevap += chunk.content

        with sqlite3.connect(DB_FILE) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT session_id FROM sessions WHERE session_id = ?", (istek.session_id,))
            if not cursor.fetchone():
                baslik = istek.soru if len(istek.soru) <= 30 else istek.soru[:30] + "..."
                cursor.execute("INSERT INTO sessions (session_id, title) VALUES (?, ?)", (istek.session_id, baslik))
            cursor.execute("INSERT INTO messages (session_id, role, content) VALUES (?, 'user', ?)", (istek.session_id, istek.soru))
            cursor.execute("INSERT INTO messages (session_id, role, content) VALUES (?, 'ai', ?)", (istek.session_id, tam_cevap))
            conn.commit()

    return StreamingResponse(stream_generator(), media_type="text/plain")


@app.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    with sqlite3.connect(DB_FILE) as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM sessions WHERE session_id = ?", (session_id,))
        conn.commit()
    return {"status": "success", "message": f"Sohbet {session_id} başarıyla silindi."}
