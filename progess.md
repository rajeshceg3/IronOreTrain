progress.md — Mauritania Iron Ore Train Experience
Task completion: ~65% (84/130 tasks)


---

0. CRITICAL PATH OVERVIEW (READ FIRST)

Critical Path Items (Blockers if delayed):

[x] Rendering engine setup (Three.js + scene lifecycle)

[x] Continuous environment streaming (desert + train)

[x] Motion system (non-camera-based human movement)

[x] Audio engine (positional + reactive)

[x] State-driven experience phases (arrival → reflection)


Failure Impact:
If any above fails → experience breaks immersion → product fails core objective.

Mitigation:

Build vertical slice early (Arrival → Boarding)

Lock rendering + motion architecture before adding content



---

1. FOUNDATIONAL SETUP

1.1 Repository Initialization

[x] Create monorepo using pnpm or turborepo

[x] Define packages:

[x] /apps/web (Next.js frontend)

[x] /packages/engine (Three.js abstractions)

[x] /packages/audio (Web Audio API layer)

[x] /packages/state (global state machine)

[x] /packages/ui (minimal UI primitives)



1.2 Tooling & Frameworks

[x] Install core stack:

[x] Next.js (App Router)

[x] Three.js

[x] React Three Fiber (R3F)

[x] Zustand (state management)

[x] Tailwind (only for minimal UI overlays)


[x] Configure ESLint + Prettier

[x] Enable strict TypeScript mode


1.3 Environment Configuration

[x] Setup .env structure:

[x] NEXT_PUBLIC_ASSET_BASE_URL

[x] NEXT_PUBLIC_AUDIO_ENABLED


[ ] Configure asset CDN (Cloudflare / S3)

[x] Enable WebGL compatibility fallback detection



---

2. ARCHITECTURE & DESIGN TASKS

2.1 System Boundaries

[x] Rendering Layer (Three.js)

[x] Interaction Layer (input → motion mapping)

[x] State Engine (experience phases)

[x] Audio Engine (environmental sound)

[x] Content Layer (text + events)



---

2.2 Component Responsibilities

Rendering Engine

[x] Scene manager (single persistent scene)

[x] Lighting system (time-based transitions)

[x] Terrain renderer (infinite desert illusion)

[x] Train system (modular wagon instancing)


Motion System

[x] Head movement mapping (mouse/touch → rotation)

[x] Forward drift mechanic (scroll → velocity)

[x] Constraint system (no free flight)


State System

[x] Define states:

[x] ARRIVAL

[x] ORIENTATION

[x] BOARDING

[x] EXPLORATION

[x] DISCOVERY

[x] NIGHT

[x] REFLECTION


[x] Implement finite state machine (Zustand or XState)



---

2.3 API Contracts (Internal Only)

[x] useExperienceState()

[x] useMotionController()

[x] useAudioEngine()

[x] useEnvironmentTime()



---

2.4 Data Models

Train Model

type Wagon = {
  id: string
  position: number
  type: "ore" | "empty"
}

Environment State

type Environment = {
  timeOfDay: "dawn" | "day" | "dusk" | "night"
  windIntensity: number
  visibility: number
}


---

3. IMPLEMENTATION PHASES


---

PHASE 1 — CORE ENGINE (BLOCKING)

3.1 Rendering Foundation

[x] Initialize Three.js scene

[x] Setup camera (fixed human-eye height)

[x] Disable default orbit controls

[x] Implement fog for depth illusion


3.2 Infinite Desert System

[x] Create tiled terrain chunks

[x] Implement chunk recycling (infinite scroll illusion)

[x] Apply procedural noise for variation


3.3 Train System

[x] Create wagon mesh (low-poly optimized)

[x] Use instancing for 200+ wagons

[x] Implement continuous movement loop



---

PHASE 2 — MOTION & IMMERSION

3.4 Movement System

[x] Map mouse → head rotation

[x] Map scroll → forward drift

[x] Clamp movement to realistic limits


3.5 Boarding Mechanic

[x] Detect wagon alignment with user

[x] Trigger velocity sync (user + train)

[x] Remove ground reference smoothly



---

PHASE 3 — AUDIO ENGINE

3.6 Audio Layers

[x] Wind layer (volume = speed)

[x] Metal layer (loop tied to motion)

[x] Engine rumble (low frequency)


3.7 Positional Audio

[x] Adjust audio based on camera direction

[x] Reduce sound when user is still



---

PHASE 4 — EXPERIENCE STATES

3.8 Arrival State

[x] Fade-in from black

[x] Gradually introduce horizon

[x] Delay train visibility


3.9 Exploration State

[x] Enable full motion system

[x] Trigger environmental effects


3.10 Night Transition

[x] Gradual sky shader change

[x] Introduce stars (GPU-efficient)



---

PHASE 5 — DISCOVERY SYSTEM

3.11 Object Placement

[x] Add cloth asset

[x] Add footprints decal

[x] Add distant human silhouette


3.12 Contextual Text System

[x] Trigger text on gaze focus

[x] Fade in/out (opacity easing)

[x] Ensure no persistent UI



---

4. CROSS-CUTTING CONCERNS


---

4.1 Performance (CRITICAL)

[ ] Use instancing for all repeated meshes

[ ] Limit draw calls < 150

[ ] Implement LOD (Level of Detail)

[ ] Cap FPS to 60


Risk: Frame drops break immersion
Mitigation: aggressive mesh optimization


---

4.2 Security

[ ] Sanitize all dynamic text content

[ ] Disable dev tools in production build (optional hardening)

[ ] Protect asset URLs via signed CDN links



---

4.3 Accessibility

[ ] Add optional reduced motion mode

[ ] Add subtitle toggle for text

[ ] Ensure contrast ratios for text



---

4.4 Observability

[ ] Integrate logging (Sentry)

[ ] Track FPS + performance metrics

[ ] Log state transitions



---

5. TESTING & VALIDATION


---

5.1 Unit Tests

[x] State machine transitions

[x] Motion calculations

[x] Audio triggers


5.2 Integration Tests

[x] Boarding sequence continuity

[x] Day → night transition

[x] Discovery triggers


5.3 E2E Tests (Playwright)

[ ] Full experience flow (arrival → reflection)

[ ] No UI artifacts appear unexpectedly

[ ] Performance remains stable > 30 FPS


5.4 Edge Cases

[ ] Low-end GPU fallback

[ ] Mobile browser compatibility

[ ] WebGL context loss recovery



---

6. DEPLOYMENT & RELEASE


---

6.1 CI/CD Pipeline

[x] Setup GitHub Actions:

[x] Lint + type check

[x] Build validation

[ ] Asset upload to CDN



6.2 Environments

[ ] Dev (local)

[ ] Staging (preview URL)

[ ] Production (CDN-backed)


6.3 Rollback Strategy

[ ] Maintain previous build on CDN

[ ] Implement versioned asset paths

[ ] One-click rollback via CI



---

7. POST-LAUNCH READINESS


---

7.1 Monitoring

[ ] FPS dashboard

[ ] Error rate tracking

[ ] Session duration tracking


7.2 Alerting

[ ] Alert if FPS < 25 avg

[ ] Alert if crash rate > 2%

[ ] Alert if load time > 5s



---

7.3 Operational Runbooks

Incident: Black Screen

Check WebGL context

Verify shader compilation

Fallback to static scene


Incident: Low FPS

Disable shadows

Reduce draw distance

Switch to low LOD mode



---

FINAL VALIDATION CHECKLIST

[ ] No visible UI elements by default

[ ] No abrupt transitions

[ ] Motion feels continuous, not mechanical

[ ] Audio reacts to user stillness

[ ] Experience can run 10+ minutes without fatigue



---

CORE SUCCESS METRIC

> User forgets they are using a website.




---
