import React from 'react';
import { cn } from '../../lib/utils';

interface ProgressProps {
    value: number;
    className?: string;
    indicatorClassName?: string;
}

export function Progress({ value, className, indicatorClassName }: ProgressProps) {
    return (
        <div
            className={cn(
                'relative h-4 w-full overflow-hidden rounded-full bg-secondary',
                className
            )}
        >
            <div
                className={cn(
                    'h-full w-full flex-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500 ease-out',
                    indicatorClassName
                )}
                style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
            />
        </div>
    );
}
