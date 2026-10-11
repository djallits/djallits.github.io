# Multi-Agent AI Systems Need Control Planes, Not Autonomous Chaos

Dan Jallits · 2026-05-25

Editorial draft based on the complete supplied text.

In discussions about multi-agent AI, I keep seeing the same assumption: agents should call one another directly and take actions across infrastructure, APIs, and business systems on their own. It’s an appealing idea at small scale. In production, it leaves some difficult questions unanswered.

Who authorizes an action? Where are its limits enforced? What happens when one agent passes a task to another, and who can reconstruct the chain afterward?

I find distributed systems a more useful starting point than the idea of an “AI employee.” An agent needs a contract, a bounded set of capabilities, and a system that can decide whether its proposed work should happen.

## A proposal is not permission

The separation I favor is straightforward: agents reason about a task, policy determines what is permitted, and execution systems carry out approved work.

Sending an email, changing infrastructure, deploying code, deleting data, or calling a third-party system all have consequences outside the model’s response. Those actions should pass through a boundary that the reasoning agent does not control.

For example, an agent investigating a failed deployment could propose the following task:

```json
{
  "intent": "investigate_failed_deployment",
  "risk": "medium",
  "requested_capabilities": [
    "read_logs",
    "read_repo",
    "summarize_findings"
  ]
}
```

This envelope describes the requested work. It does not grant access. The control plane still has to validate it, establish the caller’s identity, and evaluate the request against policy. An agent’s own risk label is an input to that assessment, not the final authority.

## Put the handoff service in charge of execution

The implementation model I currently favor uses Hermes Agent for reasoning and task proposals, Open Policy Agent (OPA) for policy decisions, and a handoff service for routing and enforcement. Work then goes to a deterministic workflow engine such as n8n, or an interactive execution runtime such as OpenClaw.

Conceptually, the flow is:

```text
Hermes Agent
    ↓
Task envelope
    ↓
Handoff service
    ↓
OPA policy decision
    ↓
Approved execution via n8n or OpenClaw
    ↓
Audit record and execution status
```

The handoff service is the operational control plane. It validates and normalizes requests, evaluates policy decisions, applies approval requirements, routes permitted work, records an audit trail, and returns status.

That boundary only works if an agent cannot bypass it. Execution systems need to accept the enforced capability limits rather than act on an unrestricted copy of the original request. The tool choices matter less than preserving that contract.

## Known workflows and investigations need different paths

Creating a ticket, sending a notification, running a backup, synchronizing systems, triggering CI, or generating a scheduled report can follow an explicit workflow. A workflow engine such as n8n is a reasonable place to execute that known path.

Investigating unusual latency, reviewing a suspicious email, triaging an inbox, comparing vendor proposals, or analyzing an operational failure involves interpretation. An interactive runtime can support that work, including clarification and human review when needed.

Both paths require controls. The distinction is how the work is carried out: a known sequence of operations, or an investigation whose next step depends on what it finds. Treating them as interchangeable makes it harder to define reliable execution boundaries.

## Policy decisions must be enforced outside the agent

OPA can provide an external decision about access, permitted operations, approval requirements, and routing. It can distinguish a read-only investigation from a production change and deny requests that exceed the caller’s authority.

A decision for an investigative task might look like this:

```json
{
  "allow": true,
  "route": "openclaw",
  "approval_required": true,
  "allowed_capabilities": [
    "read_logs",
    "read_repo",
    "propose_fix"
  ],
  "denied_capabilities": [
    "deploy_production",
    "merge_pr"
  ]
}
```

Here, “allow” does not waive the approval requirement. The handoff service must obtain that approval before executing the permitted work. It must also keep production deployment and pull-request merging out of the execution context.

OPA supplies the policy decision; it does not enforce the downstream action by itself. The service and executor have to make the decision effective. A reasoning agent should not be able to approve its own request or expand its own capabilities.

## Design for the failure you will have to explain

Production systems need explicit contracts, capability boundaries, observability, audit records, approval flows, and a route to a person when the system cannot proceed safely. Those requirements become more important when one task can involve several agents and services.

We have dealt with related problems in distributed systems: hidden coupling, unclear ownership, incomplete traces, and components with more authority than they need. Agent-based systems do not make those lessons obsolete.

The design I’d build toward is one where Hermes proposes work, OPA evaluates it, the handoff service enforces the decision, and n8n or OpenClaw executes within the approved limits. That gives the organization a place to inspect and control the handoff from a model’s suggestion to an action in the world.

## LinkedIn teaser

If an agent proposes a production fix, who decides whether it can apply it? That question gets harder when several agents can pass tasks to one another.

I favor an explicit boundary between reasoning and execution: a structured task proposal, an external policy decision, and a handoff service that enforces capability limits and approval requirements.

The full article walks through that control-plane design using Hermes Agent, OPA, n8n, and OpenClaw, including why known workflows and investigative work need different execution paths.

Read the full article: https://dan.jallits.com/posts/multi-agent-ai-control-planes/

Original: https://www.linkedin.com/pulse/multi-agent-ai-systems-need-control-planes-autonomous-dan-jallits-kwamc/
