from fastapi import FastAPI
from pydantic import BaseModel
from mcp_server.client import query_business_data, list_available_views

from sql_executor import execute_sql
from assistant import ask_hybrid_question
from rag.rag_chain import ask_rag

from fastapi.middleware.cors import CORSMiddleware
from dashboard_service import get_dashboard_overview


app = FastAPI(
    title="AI Business Data Assistant",
    description="API for business data queries and document-based RAG",
    version="1.1.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class QueryRequest(BaseModel):
    sql: str


class QuestionRequest(BaseModel):
    question: str


@app.post("/ask")
async def ask_question(request: QuestionRequest):
    return await ask_hybrid_question(request.question)


@app.post("/rag/ask")
def ask_rag_question(request: QuestionRequest):
    return ask_rag(request.question)


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AI Business Data Assistant",
    }

@app.get("/dashboard/overview")
def dashboard_overview():
    return get_dashboard_overview()

@app.post("/query")
def run_query(request: QueryRequest):
    return execute_sql(request.sql)

@app.post("/mcp/query")
async def mcp_query(request: QueryRequest):
    return await query_business_data(request.sql)


@app.get("/mcp/views")
async def mcp_views():
    return await list_available_views()