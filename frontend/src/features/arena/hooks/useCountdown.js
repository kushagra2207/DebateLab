import { useEffect, useState } from 'react';


export function useCountdown(deadline) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!deadline) return undefined;
    const update = () => setNow(Date.now());
    update();
    const timer = setInterval(update, 500);
    return () => clearInterval(timer);
  }, [deadline]);

  if (!deadline) return null;
  return Math.max(0, deadline - now);
}
