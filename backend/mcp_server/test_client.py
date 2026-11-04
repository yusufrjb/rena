import asyncio
import sys
from pathlib import Path

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client


async def main():
    backend_dir = Path(__file__).resolve().parents[1]

    server_params = StdioServerParameters(
        command=sys.executable,
        args=["-m", "mcp_server.server"],
        cwd=str(backend_dir),
        env=None,
    )

    async with stdio_client(server_params, errlog=sys.stderr) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()

            tools = await session.list_tools()

            print("MCP berhasil terhubung!")
            print("\nDaftar tools:")

            for tool in tools.tools:
                print("-", tool.name)

            result = await session.call_tool(
                "query_business_data",
                {
                    "sql": """
                        "DELETE FROM olist.orders;"
                    """
                },
            )

            print("\nHasil query melalui MCP:")
            for content in result.content:
                if hasattr(content, "text"):
                    print(content.text)

            print("\nHasil pemanggilan tool:")
            for content in result.content:
                if hasattr(content, "text"):
                    print(content.text)


if __name__ == "__main__":
    asyncio.run(main())