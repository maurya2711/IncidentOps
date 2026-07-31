'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const [strength, setStrength] = useState(0);
  const [label, setLabel] = useState('');
  const [color, setColor] = useState('');

  useEffect(() => {
    if (!password) {
      setStrength(0);
      setLabel('');
      setColor('');
      return;
    }

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    setStrength(Math.min(score, 4));

    switch (score) {
      case 0:
      case 1:
        setLabel('Weak');
        setColor('bg-destructive');
        break;
      case 2:
        setLabel('Fair');
        setColor('bg-orange-500');
        break;
      case 3:
        setLabel('Good');
        setColor('bg-yellow-500');
        break;
      case 4:
      case 5:
      case 6:
        setLabel('Strong');
        setColor('bg-green-500');
        break;
      default:
        setLabel('');
        setColor('');
    }
  }, [password]);

  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((level) => (
          <motion.div
            key={level}
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            className={`h-1 flex-1 rounded-full transition-colors ${
              level <= strength ? color : 'bg-input'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Password strength: {label}</p>
    </div>
  );
}
