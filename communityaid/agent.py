from google.adk.agents import Agent
from communityaid.tools import (
    analyse_need,
    get_volunteers,
    match_volunteer,
    get_all_needs,
    get_stats
)

needs_analyst = Agent(
    name="needs_analyst",
    model="gemini-2.0-flash",
    description="Analyses community need reports and scores their urgency.",
    instruction="""You are a community needs analyst. When given a need report:
1. Score urgency from 1-10 (10 = most urgent)
2. Categorise it: food, medical, shelter, education, or other
3. Extract location
4. Call analyse_need() with your findings
Always be concise and factual.""",
    tools=[analyse_need]
)

volunteer_matcher = Agent(
    name="volunteer_matcher",
    model="gemini-2.0-flash",
    description="Matches volunteers to community needs based on skills and location.",
    instruction="""You are a volunteer coordinator. When asked to match a need:
1. Call get_volunteers() to see available volunteers
2. Find the best match based on skills and location
3. Call match_volunteer() to assign them
Explain your matching reasoning briefly.""",
    tools=[get_volunteers, match_volunteer]
)

report_agent = Agent(
    name="report_agent",
    model="gemini-2.0-flash",
    description="Generates reports and statistics about needs and volunteer coverage.",
    instruction="""You are a reporting agent. When asked for stats or reports:
1. Call get_stats() to get current data
2. Summarise key metrics clearly
3. Highlight critical gaps where needs are unmet
Keep reports brief and actionable.""",
    tools=[get_stats, get_all_needs]
)

root_agent = Agent(
    name="coordinator",
    model="gemini-2.0-flash",
    description="Master coordinator that routes tasks to specialist agents.",
    instruction="""You are CommunityAid's AI coordinator managing 3 specialist agents:
- needs_analyst: analyses and scores community need reports
- volunteer_matcher: matches volunteers to urgent needs
- report_agent: generates stats and impact reports

When a user submits a need → delegate to needs_analyst, then volunteer_matcher.
When a user asks for stats or reports → delegate to report_agent.
Always summarise the final result clearly for the user.""",
    sub_agents=[needs_analyst, volunteer_matcher, report_agent]
)