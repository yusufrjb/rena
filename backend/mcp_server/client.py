import json
import sys
from pathlib import Path
import os
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client



BACKEND_DIR = Path(__file__).resolve().parents[1]


async def call_mcp_tool(tool_name: str, arguments: dict) -> dict:
    server_params = StdioServerParameters(
        command=sys.executable,
        args=["-m", "mcp_server.server"],
        cwd=str(BACKEND_DIR),
        env=os.environ.copy(),
    )

    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()

            result = await session.call_tool(
                tool_name,
                arguments,
            )
            print("DEBUG MCP RAW RESULT:", repr(result), file=sys.stderr)

            if result.isError:
                raise RuntimeError("MCP tool gagal dijalankan.")

            contents = [
                content.text
                for content in result.content
                if hasattr(content, "text")
            ]

            if not contents:
                return {"result": None}

            if len(contents) == 1:
                try:
                    return json.loads(contents[0])
                except json.JSONDecodeError:
                    return {"result": contents[0]}

            return {"result": contents}

async def discover_mcp_tools() -> list[dict]:
    server_params = StdioServerParameters(
        command=sys.executable,
        args=["-m", "mcp_server.server"],
        cwd=str(BACKEND_DIR),
        env=os.environ.copy(),
    )

    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()

            result = await session.list_tools()

            return [
                {
                    "name": tool.name,
                    "description": tool.description,
                    "input_schema": tool.inputSchema,
                }
                for tool in result.tools
            ]

async def get_mcp_tool_descriptions() -> str:
    tools = await discover_mcp_tools()

    descriptions = []

    for tool in tools:
        descriptions.append(
            f"Tool: {tool['name']}\n"
            f"Description: {tool['description']}\n"
            f"Input Schema: {json.dumps(tool['input_schema'], ensure_ascii=False)}"
        )

    return "\n\n".join(descriptions)

async def query_business_data(sql: str) -> dict:
    return await call_mcp_tool(
        "query_business_data",
        {"sql": sql},
    )


async def list_available_views() -> dict:
    return await call_mcp_tool(
        "list_available_views",
        {},
    )