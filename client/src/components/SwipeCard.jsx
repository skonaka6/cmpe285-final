import { useEffect, useRef, useState } from "react";

const THRESHOLD = 90;
const TINT_START = 20;
const MAX_TINT = 0.42;

export default function SwipeCard({ item, onVote, onSwipeTint, disabled }) {
  const cardRef = useRef(null);
  const dragRef = useRef({ active: false, startX: 0, startY: 0, x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [exiting, setExiting] = useState(null);

  function applyTransform(x, y) {
    const rotate = x * 0.08;
    if (cardRef.current) {
      cardRef.current.style.transform = `translate(${x}px, ${y}px) rotate(${rotate}deg)`;
    }
  }

  function updateBackgroundTint(x) {
    if (!onSwipeTint) return;
    if (x > TINT_START) {
      const strength = Math.min(x / THRESHOLD, 1) * MAX_TINT;
      onSwipeTint("yes", strength);
    } else if (x < -TINT_START) {
      const strength = Math.min(Math.abs(x) / THRESHOLD, 1) * MAX_TINT;
      onSwipeTint("no", strength);
    } else {
      onSwipeTint(null, 0);
    }
  }

  function clearBackgroundTint() {
    onSwipeTint?.(null, 0);
  }

  function resetTransform() {
    if (cardRef.current) {
      cardRef.current.style.transform = "";
      cardRef.current.style.transition = "";
    }
    setOffset({ x: 0, y: 0 });
    clearBackgroundTint();
  }

  useEffect(() => () => clearBackgroundTint(), []);

  function commitVote(choice, x) {
    if (disabled || exiting) return;
    setExiting(choice);
    onSwipeTint?.(choice, MAX_TINT);
    const direction = choice === "yes" ? 1 : -1;
    if (cardRef.current) {
      cardRef.current.style.transition = "transform 0.28s ease-out";
      cardRef.current.style.transform = `translate(${direction * 520}px, ${x * 0.2}px) rotate(${direction * 24}deg)`;
    }
    setTimeout(() => onVote(choice), 280);
  }

  function onPointerDown(e) {
    if (disabled || exiting) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      x: 0,
      y: 0,
    };
    if (cardRef.current) cardRef.current.style.transition = "";
  }

  function onPointerMove(e) {
    if (!dragRef.current.active || disabled || exiting) return;
    const x = e.clientX - dragRef.current.startX;
    const y = (e.clientY - dragRef.current.startY) * 0.35;
    dragRef.current.x = x;
    dragRef.current.y = y;
    applyTransform(x, y);
    setOffset({ x, y });
    updateBackgroundTint(x);
  }

  function onPointerUp() {
    if (!dragRef.current.active || disabled || exiting) return;
    dragRef.current.active = false;
    const { x } = dragRef.current;

    if (x > THRESHOLD) commitVote("yes", x);
    else if (x < -THRESHOLD) commitVote("no", x);
    else resetTransform();
  }

  const hint =
    offset.x > 40 ? "yes" : offset.x < -40 ? "no" : null;

  return (
    <article
      ref={cardRef}
      className={`swipe-card ${exiting ? `exiting-${exiting}` : ""} ${hint ? `hint-${hint}` : ""}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div className="swipe-card-image-wrap">
        <img
          src={item.imageUrl}
          alt={item.title}
          draggable={false}
          loading="eager"
        />
      </div>
      <div className="swipe-card-body">
        <h2>{item.title}</h2>
        <p>{item.description}</p>
      </div>
      <span className="stamp stamp-yes">YES</span>
      <span className="stamp stamp-no">PASS</span>
    </article>
  );
}
