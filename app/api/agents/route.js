import { Agent, Task, Team } from "kaibanjs"
import { TavilySearchResults } from '@langchain/community/tools/tavily_search'
import { NextResponse } from "next/server"

// Initialize search tool
const searchTool = new TavilySearchResults({
    maxResults: 5,
    apiKey: process.env.TAVILY_API_KEY
})

const researchAgent = new Agent({
    name: "Sonam Bajwa",
    role: "Place Researcher",
    goal: 'Find the best places to visit in Srinagar',
    background: "Experienced in information gathering",
    tools: [searchTool],
    llmConfig: {
        provider: 'google',
        model: 'gemini-2.0-flash',
        apiKey: process.env.GOOGLE_API_KEY
    }
})

const writerAgent = new Agent({
    name: "Diljit Dosanjh",
    role: "Content Writer",
    goal: "Create engaging and informative blog posts on provided information",
    background: "Experienced in content writing",
    llmConfig: {
        provider: 'google',
        model: 'gemini-2.0-flash',
        apiKey: process.env.GOOGLE_API_KEY
    }
})

const researchWeb = new Task({
    title: "Research Places in Srinagar",
    description: "Search the web for information about tourist places in Srinagar",
    agent: researchAgent,
    expectedOutput: 'A detailed report containing information about tourist places in Srinagar including popular attractions, historical sites, best visiting times, cultural significance, hidden gems and local vegetarian cuisine',
})

const writeBlogs = new Task({
    title: "Write Blog Posts about Srinagar",
    description: "Create engaging blog posts about tourist places in Srinagar using the research information",
    agent: writerAgent,
    expectedOutput: 'A collection of well-written, engaging blog posts about tourist places in Srinagar, incorporating the research findings and highlighting attractions, cultural aspects, and local experiences',
})

// Create a team of agents
const travelPlannerTeam = new Team({
  name: "Srinagar Travel Guide Team",
  agents: [researchAgent, writerAgent],
  tasks: [researchWeb, writeBlogs],
  teamConfig: {
    workflow: 'sequential',
    maxConcurrency: 1
  }
})

export async function GET(request) {
  try {
    const { searchParams } = new URL(request?.url)
    let topic = searchParams.get("topic") || "srinagar itenary for 6 days"
    const output = await travelPlannerTeam.start({ topic })

    if(output.status === 'FINISHED'){
      return NextResponse.json({
        output: output.result
      })
    }else{
      return NextResponse.json({
        status: 'FAILED',
        message: "Unable to generate blog post"
      })
    }

  } catch (error) {
    return NextResponse.json({
      status: 'ERROR',
      message: error.toString()
    })
  }
}

GET();



