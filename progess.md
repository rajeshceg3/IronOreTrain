progress.md — Mauritania Iron Ore Train Experience


---

0. CRITICAL PATH OVERVIEW (READ FIRST)

Critical Path Items (Blockers if delayed):

[ ] Rendering engine setup (Three.js + scene lifecycle)

[ ] Continuous environment streaming (desert + train)

[ ] Motion system (non-camera-based human movement)

[ ] Audio engine (positional + reactive)

[ ] State-driven experience phases (arrival → reflection)


Failure Impact:
If any above fails → experience breaks immersion → product fails core objective.

Mitigation:

Build vertical slice early (Arrival → Boarding)

Lock rendering + motion architecture before adding content



---

1. FOUNDATIONAL SETUP

1.1 Repository Initialization

[ ] Create monorepo using pnpm or turborepo

[ ] Define packages:

[ ] /apps/web (Next.js frontend)

[ ] /packages/engine (Three.js abstractions)

[ ] /packages/audio (Web Audio API layer)

[ ] /packages/state (global state machine)

[ ] /packages/ui (minimal UI primitives)



1.2 Tooling & Frameworks

[ ] Install core stack:

[ ] Next.js (App Router)

[ ] Three.js

[ ] React Three Fiber (R3F)

[ ] Zustand (state management)

[ ] Tailwind (only for minimal UI overlays)


[ ] Configure ESLint + Prettier

[ ] Enable strict TypeScript mode


1.3 Environment Configuration

[ ] Setup .env structure:

[ ] NEXT_PUBLIC_ASSET_BASE_URL

[ ] NEXT_PUBLIC_AUDIO_ENABLED


[ ] Configure asset CDN (Cloudflare / S3)

[ ] Enable WebGL compatibility fallback detection



---

2. ARCHITECTURE & DESIGN TASKS

2.1 System Boundaries

[ ] Rendering Layer (Three.js)

[ ] Interaction Layer (input → motion mapping)

[ ] State Engine (experience phases)

[ ] Audio Engine (environmental sound)

[ ] Content Layer (text + events)



---

2.2 Component Responsibilities

Rendering Engine

[ ] Scene manager (single persistent scene)

[ ] Lighting system (time-based transitions)

[ ] Terrain renderer (infinite desert illusion)

[ ] Train system (modular wagon instancing)


Motion System

[ ] Head movement mapping (mouse/touch → rotation)

[ ] Forward drift mechanic (scroll → velocity)

[ ] Constraint system (no free flight)


State System

[ ] Define states:

[ ] ARRIVAL

[ ] ORIENTATION

[ ] BOARDING

[ ] EXPLORATION

[ ] DISCOVERY

[ ] NIGHT

[ ] REFLECTION


[ ] Implement finite state machine (Zustand or XState)



---

2.3 API Contracts (Internal Only)

[ ] useExperienceState()

[ ] useMotionController()

[ ] useAudioEngine()

[ ] useEnvironmentTime()



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

[ ] Initialize Three.js scene

[ ] Setup camera (fixed human-eye height)

[ ] Disable default orbit controls

[ ] Implement fog for depth illusion


3.2 Infinite Desert System

[ ] Create tiled terrain chunks

[ ] Implement chunk recycling (infinite scroll illusion)

[ ] Apply procedural noise for variation


3.3 Train System

[ ] Create wagon mesh (low-poly optimized)

[ ] Use instancing for 200+ wagons

[ ] Implement continuous movement loop



---

PHASE 2 — MOTION & IMMERSION

3.4 Movement System

[ ] Map mouse → head rotation

[ ] Map scroll → forward drift

[ ] Clamp movement to realistic limits


3.5 Boarding Mechanic

[ ] Detect wagon alignment with user

[ ] Trigger velocity sync (user + train)

[ ] Remove ground reference smoothly



---

PHASE 3 — AUDIO ENGINE

3.6 Audio Layers

[ ] Wind layer (volume = speed)

[ ] Metal layer (loop tied to motion)

[ ] Engine rumble (low frequency)


3.7 Positional Audio

[ ] Adjust audio based on camera direction

[ ] Reduce sound when user is still



---

PHASE 4 — EXPERIENCE STATES

3.8 Arrival State

[ ] Fade-in from black

[ ] Gradually introduce horizon

[ ] Delay train visibility


3.9 Exploration State

[ ] Enable full motion system

[ ] Trigger environmental effects


3.10 Night Transition

[ ] Gradual sky shader change

[ ] Introduce stars (GPU-efficient)



---

PHASE 5 — DISCOVERY SYSTEM

3.11 Object Placement

[ ] Add cloth asset

[ ] Add footprints decal

[ ] Add distant human silhouette


3.12 Contextual Text System

[ ] Trigger text on gaze focus

[ ] Fade in/out (opacity easing)

[ ] Ensure no persistent UI



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

[ ] State machine transitions

[ ] Motion calculations

[ ] Audio triggers


5.2 Integration Tests

[ ] Boarding sequence continuity

[ ] Day → night transition

[ ] Discovery triggers


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

[ ] Setup GitHub Actions:

[ ] Lint + type check

[ ] Build validation

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

