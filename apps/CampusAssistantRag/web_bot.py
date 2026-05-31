import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_classic.agents import create_tool_calling_agent, AgentExecutor
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()


def web_botunu_baslat():
    # İnternet araması için Tavily aracı (En iyi 3 sonucu getirir)
    web_araci = TavilySearchResults(max_results=3)
    tools = [web_araci]

    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.5)

    prompt = ChatPromptTemplate.from_messages([
        ("system", """Sen yetenekli bir Web Araştırma Asistanısın. 
        Kullanıcının sorduğu soruların cevabını bulmak için HER ZAMAN 'tavily_search_results_json' aracını kullanarak internette arama yap.
        Bulduğun sonuçları Türkçe, anlaşılır, doğal bir dille ve SADECE net cevabı içerecek şekilde sun. Bütün ham verileri, JSON formatlarını veya karmaşık linkleri gizle."""),
        ("human", "{input}"),
        ("placeholder", "{agent_scratchpad}"),
    ])

    agent = create_tool_calling_agent(llm, tools, prompt)

    # BÜYÜK DEĞİŞİKLİK: verbose=False yaptık. Artık arka plandaki işlemleri ve ham verileri ekrana basmayacak.
    agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=False)

    print("\n🌍 WEB ARAŞTIRMA BOTU HAZIR (Sade Metin Modu) 🌍\n")
    while True:
        soru = input("Sen: ")
        if soru.lower() in ['q', 'çıkış', 'exit']:
            print("Bot kapatılıyor...")
            break

        print("\nİnternette araştırılıyor...\n")

        # Sadece net string metni alıyoruz
        cevap = agent_executor.invoke({"input": soru})

        print(f"Web Botu: {cevap['output']}\n")
        print("-" * 50)


if __name__ == "__main__":
    web_botunu_baslat()