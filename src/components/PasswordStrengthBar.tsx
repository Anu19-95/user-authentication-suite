import React from 'react';
import { Check, X } from 'lucide-react';
import { PasswordStrength } from '../types';

interface PasswordStrengthBarProps {
  strength: PasswordStrength;
  showCriteria?: boolean;
}

export const PasswordStrengthBar: React.FC<PasswordStrengthBarProps> = ({
  strength,
  showCriteria = true,
}) => {
  const criteria = [
    { label: 'At least 8 characters', met: strength.hasLength },
    { label: 'Uppercase letter (A-Z)', met: strength.hasUppercase },
    { label: 'Lowercase letter (a-z)', met: strength.hasLowercase },
    { label: 'Number (0-9)', met: strength.hasNumber },
    { label: 'Special character (!@#$%)', met: strength.hasSpecial },
  ];

  const getBarColor = (index: number) => {
    if (strength.score === 0) return 'bg-slate-200';
    if (index >= strength.score) return 'bg-slate-200';
    switch (strength.score) {
      case 1:
        return 'bg-rose-500';
      case 2:
        return 'bg-amber-500';
      case 3:
        return 'bg-yellow-500';
      case 4:
        return 'bg-emerald-500';
      default:
        return 'bg-slate-200';
    }
  };

  return (
    <div id="password-strength-container" className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500 font-medium">Password strength</span>
        <span className={`font-semibold ${strength.score === 0 ? 'text-slate-400' : ''} ${strength.score === 1 ? 'text-rose-600' : ''} ${strength.score === 2 ? 'text-amber-600' : ''} ${strength.score === 3 ? 'text-yellow-600' : ''} ${strength.score === 4 ? 'text-emerald-600' : ''}`}>
          {strength.score === 0 ? 'Too weak' : strength.label}
        </span>
      </div>

      {/* 4 segmented bars */}
      <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
        {[0, 1, 2, 3].map((idx) => (
          <div
            key={idx}
            className={`h-full rounded-full transition-all duration-300 ${getBarColor(idx)}`}
          />
        ))}
      </div>

      {showCriteria && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1.5 text-xs text-slate-600">
          {criteria.map((item, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <span
                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] shrink-0 transition-colors ${
                  item.met
                    ? 'bg-emerald-100 text-emerald-700 font-bold'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {item.met ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
              </span>
              <span className={item.met ? 'text-slate-700' : 'text-slate-400'}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
