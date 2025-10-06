from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
import os
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Créer l'app FastAPI
app = FastAPI()

# Configuration du CORS pour autoriser le front React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Front React
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modèle de la requête entrante
class OCRRequest(BaseModel):
    texte_ocr: str

# Fonction de génération du prompt
def get_prompt(ocr_text: str) -> str:
    return f"""
Tu es un expert caviste avec plus de 30 ans d'expérience. Tu dois analyser l'étiquette suivante :

"{ocr_text}"

Ton objectif est d’extraire les informations suivantes et de les structurer au format JSON :

- nom
- region
- pays
- appellation
- millesime
- type_vin
- apogee (nommée "APOGEE")
- taux_alcool
- contenance
- type_bouteille
- conservation
- producteur:
    - nom
    - adresse
    - site
- prix_moyen
- cepages (liste)
- conseil (nommée "CONSEIL")

Retourne uniquement un objet JSON valide (sans explication), contenant toutes les données extraites ou null si absentes.
"""

# Endpoint de traitement
@app.post("/analyse_etiquette")
async def analyse_etiquette(request: OCRRequest):
    prompt = get_prompt(request.texte_ocr)

    # Créer le LLM avec LangChain
    chat = ChatOpenAI(model_name="gpt-3.5-turbo", temperature=0, api_key=OPENAI_API_KEY)

    # Appliquer le prompt avec LangChain
    chain = ChatPromptTemplate.from_template("{question}").invoke({"question": prompt})
    result = chat.invoke(chain)

    return {"result": result.content}
