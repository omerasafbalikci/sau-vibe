import os
import asyncio
import sqlite3
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_community.retrievers import BM25Retriever
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_classic.chains import ConversationalRetrievalChain
from langchain_classic.memory import ConversationBufferMemory
from langchain_classic.callbacks import AsyncIteratorCallbackHandler
from langchain_classic.schema import HumanMessage, AIMessage, SystemMessage

load_dotenv()

app = FastAPI(title="Sakarya Kampüs Asistanı API", version="2.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_FILE = "/app/data_store/campus_history.db"
retriever_instance = None


def veritabanini_ilklendir():
    os.makedirs(os.path.dirname(DB_FILE), exist_ok=True)
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


def get_retriever():
    global retriever_instance
    if retriever_instance is None:
        print("PDF'ler yükleniyor, BM25 indeksi oluşturuluyor...")
        loader = PyPDFDirectoryLoader("data")
        docs = loader.load()
        splitter = RecursiveCharacterTextSplitter(chunk_size=600, chunk_overlap=150)
        chunks = splitter.split_documents(docs)
        retriever_instance = BM25Retriever.from_documents(chunks, k=10)
        print("BM25 indeksi hazır!")
    return retriever_instance


@app.on_event("startup")
async def startup_event():
    veritabanini_ilklendir()
    print("🚀 Sunucu hazır! BM25 indeksi ilk istekte yüklenecek.")


class SoruIstegi(BaseModel):
    session_id: str
    soru: str


def get_gecmis(session_id: str):
    with sqlite3.connect(DB_FILE) as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT role, content FROM messages WHERE session_id = ? ORDER BY id ASC",
            (session_id,)
        )
        return cursor.fetchall()


def kaydet(session_id: str, soru: str, cevap: str):
    with sqlite3.connect(DB_FILE) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT session_id FROM sessions WHERE session_id = ?", (session_id,))
        if not cursor.fetchone():
            baslik = soru[:30] + "..." if len(soru) > 30 else soru
            cursor.execute("INSERT INTO sessions (session_id, title) VALUES (?, ?)", (session_id, baslik))
        cursor.execute("INSERT INTO messages (session_id, role, content) VALUES (?, 'user', ?)", (session_id, soru))
        cursor.execute("INSERT INTO messages (session_id, role, content) VALUES (?, 'ai', ?)", (session_id, cevap))
        conn.commit()


@app.post("/chat")
async def chat_endpoint(istek: SoruIstegi):
    hafiza = ConversationBufferMemory(memory_key="chat_history", return_messages=True, output_key="answer")
    for role, content in get_gecmis(istek.session_id):
        if role == "user":
            hafiza.chat_memory.add_user_message(content)
        elif role == "ai":
            hafiza.chat_memory.add_ai_message(content)

    callback = AsyncIteratorCallbackHandler()
    sessiz_llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.1)
    asistan_llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash", temperature=0.1, streaming=True, callbacks=[callback]
    )

    prompt_sablonu = """Sen Sakarya Üniversitesi Bilgisayar ve Bilişim Bilimleri Fakültesi öğrencileri için hazırlanmış Kampüs Asistanısın.
Aşağıdaki metinleri kullanarak soruyu cevapla. Yönetmelikteki oranları, şartları ve rakamları KESİNLİKLE atlama.

ÇOK ÖNEMLİ KURAL: Eğer sorunun cevabı aşağıdaki metinlerde KESİNLİKLE YOKSA, hiçbir şey uydurma ve sadece şu cümleyi söyle:
"Bu konuda yönergelerde net bir bilgi bulamadım. Lütfen detaylı bilgi için Fakülte Öğrenci İşleri ile iletişime geçiniz: https://bf.sakarya.edu.tr/tr/2931/iletisim"

Metinler:
{context}

Soru: {question}
Cevap:"""

    qa_chain = ConversationalRetrievalChain.from_llm(
        llm=asistan_llm,
        condense_question_llm=sessiz_llm,
        retriever=get_retriever(),
        memory=hafiza,
        combine_docs_chain_kwargs={"prompt": PromptTemplate(
            template=prompt_sablonu, input_variables=["context", "question"]
        )}
    )

    async def stream_generator():
        task = asyncio.create_task(qa_chain.ainvoke({"question": istek.soru}))
        tam_cevap = ""
        async for token in callback.aiter():
            yield token
            tam_cevap += token
        await task
        kaydet(istek.session_id, istek.soru, tam_cevap)

    return StreamingResponse(stream_generator(), media_type="text/plain")


@app.post("/general-chat")
async def general_chat_endpoint(istek: SoruIstegi):
    mesajlar = [SystemMessage(content="Sen kullanıcılara her türlü genel konuda yardımcı olan, samimi, kibar ve zeki bir yapay zeka asistanısın.")]
    for role, content in get_gecmis(istek.session_id):
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
        kaydet(istek.session_id, istek.soru, tam_cevap)

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
        return [dict(row) for row in cursor.fetchall()]


@app.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    with sqlite3.connect(DB_FILE) as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM sessions WHERE session_id = ?", (session_id,))
        conn.commit()
    return {"status": "success", "message": f"Sohbet {session_id} silindi."}
