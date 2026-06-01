import os
import asyncio
import sqlite3
from typing import List, Dict
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_classic.chains.retrieval_qa.base import RetrievalQA
from langchain_core.prompts import PromptTemplate
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_classic.chains import ConversationalRetrievalChain
from langchain_classic.memory import ConversationBufferMemory
from langchain_classic.callbacks import AsyncIteratorCallbackHandler
from langchain_classic.schema import HumanMessage, AIMessage, SystemMessage

load_dotenv()

# --- 1. FASTAPI VE CORS AYARLARI ---
app = FastAPI(title="Sakarya Kampüs Asistanı SaaS API", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_FILE = "/app/data_store/campus_history.db"
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
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2",
        model_kwargs={"device": "cpu"},
        encode_kwargs={"batch_size": 8}
    )
    if not os.path.exists("chroma_db") or not os.listdir("chroma_db"):
        print("Yerel Vektör Veritabanı oluşturuluyor...")
        loader = PyPDFDirectoryLoader("data")
        docs = loader.load()
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=600, chunk_overlap=150)
        chunks = text_splitter.split_documents(docs)
        v_store = Chroma.from_documents(documents=chunks, embedding=embeddings, persist_directory="chroma_db")
        print("Vektör Veritabanı başarıyla oluşturuldu!")
        return v_store
    else:
        return Chroma(persist_directory="chroma_db", embedding_function=embeddings)


@app.on_event("startup")
async def startup_event():
    # Sadece SQLite'ı başlat — vektör DB ilk istekte lazy yüklenir
    veritabanini_ilklendir()
    print("🚀 Sunucu Ayağa Kalktı! Vektör DB ilk istekte yüklenecek.")


def get_vector_store():
    global vector_store
    if vector_store is None:
        vector_store = veritabanini_hazirla()
    return vector_store


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
        gecmis_mesajlar = cursor.fetchall()
        for role, content in gecmis_mesajlar:
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
        retriever=get_vector_store().as_retriever(search_kwargs={"k": 10}),
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
        rows = cursor.fetchall()
        return [dict(row) for row in rows]


@app.get("/sessions/{session_id}")
async def get_session_history(session_id: str):
    with sqlite3.connect(DB_FILE) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT role, content, timestamp FROM messages WHERE session_id = ? ORDER BY id ASC", (session_id,))
        rows = cursor.fetchall()
        if not rows:
            return []
        return [dict(row) for row in rows]


@app.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    with sqlite3.connect(DB_FILE) as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM sessions WHERE session_id = ?", (session_id,))
        conn.commit()
    return {"status": "success", "message": f"Sohbet {session_id} başarıyla silindi."}


@app.post("/general-chat")
async def general_chat_endpoint(istek: SoruIstegi):
    mesajlar = [
        SystemMessage(content="Sen kullanıcılara her türlü genel konuda yardımcı olan, samimi, kibar ve zeki bir yapay zeka asistanısın.")
    ]

    with sqlite3.connect(DB_FILE) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT role, content FROM messages WHERE session_id = ? ORDER BY id ASC", (istek.session_id,))
        gecmis_mesajlar = cursor.fetchall()
        for role, content in gecmis_mesajlar:
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
