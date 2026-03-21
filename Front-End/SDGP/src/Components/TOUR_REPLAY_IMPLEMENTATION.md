# Onboarding Tour - Replay & Fixed Element Support

## ✅ Completed Tasks

### 1. Fixed Navbar Spotlight Misalignment

**Problem:** Fixed elements (navbar) weren't handled correctly during scrolling.

**Solution:** Added position detection to skip scrolling for fixed elements while maintaining accurate spotlight positioning.

**Code Changes:** `OnboardingTour.jsx:28-65`

```javascript
// Check if element is fixed position
const isFixed =
  window.getComputedStyle(element).position === "fixed" ||
  element.closest('[style*="position: fixed"]') !== null ||
  element.closest(".fixed") !== null;

// Only scroll if element is not fixed
if (!isFixed && container) {
  const elementTop = element.offsetTop;
  container.scrollTo({
    top: elementTop - container.clientHeight / 2 + element.clientHeight / 2,
    behavior: "smooth",
  });
}
```

**How it works:**

- Detects if target element is `position: fixed`
- Skips scrolling for fixed elements (already visible)
- Maintains spotlight positioning using `getBoundingClientRect()` (works for all elements)
- Scrolls only non-fixed elements into view

---

### 2. Implemented Replayable Onboarding

**Problem:** Tour only ran once, required page reload to replay.

**Solution:** Added `forceRun` prop to bypass localStorage check and reset tour state.

**Code Changes:**

**OnboardingTour.jsx:10-33**

```javascript
const OnboardingTour = ({
  steps,
  onComplete,
  onSkip,
  storageKey = "hasSeenTour",
  forceRun = false, // NEW
}) => {
  // Check initial load OR forced replay
  useEffect(() => {
    const hasSeenTour = localStorage.getItem(storageKey);
    if ((!hasSeenTour || forceRun) && steps.length > 0) {
      setTimeout(() => setIsVisible(true), 800);
    }
  }, [storageKey, steps.length, forceRun]);

  // Handle replay: reset state when forceRun becomes true
  useEffect(() => {
    if (forceRun && steps.length > 0) {
      setCurrentStep(0);
      setIsVisible(true);
    }
  }, [forceRun, steps.length]);
};
```

**MyDashboard.jsx**

```javascript
// Add state
const [replayTour, setReplayTour] = useState(false);

// Pass forceRun prop
<OnboardingTour
  steps={onboardingSteps}
  storageKey="riceVisionOnboardingComplete"
  forceRun={replayTour} // NEW
  onComplete={() => {
    console.log("Onboarding completed");
    setReplayTour(false); // Reset flag
  }}
  onSkip={() => {
    console.log("Onboarding skipped");
    setReplayTour(false); // Reset flag
  }}
/>;

// Listen for replay events
useEffect(() => {
  const handleReplayTour = () => {
    setReplayTour(true);
  };

  window.addEventListener("replay-onboarding-tour", handleReplayTour);

  return () => {
    window.removeEventListener("replay-onboarding-tour", handleReplayTour);
  };
}, []);
```

**How it works:**

- `forceRun` prop bypasses localStorage check
- Resets `currentStep` to 0 and shows tour
- Parent resets flag after completion/skip
- No page reload required

---

### 3. Added "Take a Quick Tour" Button

**Location:** Help page → Quick Help section

**Code Changes:** `Help.jsx`

**Import:**

```javascript
import { useNavigate } from "react-router-dom";

const Help = () => {
  const navigate = useNavigate();
  // ...
```

**Button:**

```jsx
<button
  onClick={() => {
    // Navigate to dashboard
    navigate("/dashboard");
    // Dispatch custom event to trigger tour replay after navigation
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("replay-onboarding-tour"));
    }, 500);
  }}
  className="w-full mb-6 glass bg-cyan-400/35 hover:bg-cyan-400/45 text-cyan-950 py-3 px-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-[0.98] border border-cyan-500/60 shadow-lg shadow-cyan-500/10 flex items-center justify-center gap-2"
>
  <QuestionMarkCircleIcon className="w-4 h-4" />
  Take a Quick Tour
</button>
```

**How it works:**

- Navigates to dashboard route
- Waits 500ms for navigation to complete
- Dispatches custom event `replay-onboarding-tour`
- Dashboard listens for event and triggers replay

---

## 🎯 Architecture

**Event-Based Communication:**

```
Help Page                  Custom Event                  Dashboard
   |                           |                            |
   | Click Button              |                            |
   |-------------------------->|                            |
   |                           |                            |
   | Navigate to /dashboard    |                            |
   |-------------------------->|                            |
   |                           |                            |
   | Dispatch Event            |                            |
   |-------------------------->|--------------------------->|
   |                           |                            |
   |                           |        setReplayTour(true) |
   |                           |                            |
   |                           |      OnboardingTour reruns |
```

**Benefits:**

- No prop drilling
- No React Context needed
- Clean component separation
- Works across routes
- Minimal coupling

---

## 🧪 Testing

### Test Fixed Element Spotlight

1. Start tour (clear localStorage if needed)
2. Step 1 should highlight navbar (fixed element)
3. Verify spotlight aligns correctly
4. Verify page doesn't scroll (navbar already visible)

### Test Tour Replay

1. Complete or skip tour
2. Go to Help page
3. Click "Take a Quick Tour"
4. Should navigate to Dashboard
5. Tour should restart from step 1
6. No page reload

### Commands

```javascript
// Reset tour (console)
localStorage.removeItem("riceVisionOnboardingComplete");
location.reload();

// Trigger replay programmatically
window.dispatchEvent(new CustomEvent("replay-onboarding-tour"));
```

---

## 📊 Files Modified

1. **OnboardingTour.jsx** (Lines 10-65)
   - Added `forceRun` prop
   - Added replay useEffect
   - Added fixed element detection
   - Skip scroll for fixed elements

2. **MyDashboard.jsx** (Lines 85, 222-232, 823-834)
   - Added `replayTour` state
   - Added event listener for replay
   - Updated OnboardingTour props

3. **Help.jsx** (Lines 1-11, 71-72, 321-331)
   - Imported useNavigate
   - Added navigate instance
   - Added "Take a Quick Tour" button

---

## 🚨 Edge Cases Handled

1. **Fixed elements scroll:** Detects and skips
2. **Multiple replay clicks:** State resets properly
3. **Navigation timing:** 500ms delay ensures DOM ready
4. **Event cleanup:** Listeners removed on unmount
5. **Missing elements:** Continues without crashing

---

## 💡 Technical Decisions

**Why Custom Events?**

- Avoids prop drilling through React Router
- No Context API overhead
- Clean separation of concerns
- Standard browser API

**Why 500ms delay?**

- Ensures navigation completes
- Allows DOM to settle
- Prevents race conditions
- Better UX (smooth transition)

**Why forceRun prop?**

- Clean prop interface
- Easy to understand
- Works with React's rendering model
- Testable and predictable

---

## 🎨 UX Improvements

**Before:**

- Navbar spotlight misaligned on fixed elements
- Page scrolled unnecessarily for navbar
- Tour couldn't be replayed
- Required page reload

**After:**

- Accurate spotlight for all elements
- Smart scroll (only when needed)
- Replayable from Help page
- Smooth navigation + replay
- No page reload required
