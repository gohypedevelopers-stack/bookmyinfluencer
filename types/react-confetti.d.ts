declare module 'react-confetti' {
    import * as React from 'react';

    export interface ConfettiProps {
        width?: number;
        height?: number;
        numberOfPieces?: number;
        recycle?: boolean;
        run?: boolean;
        colors?: string[];
        opacity?: number;
        initialVelocityX?: number;
        initialVelocityY?: number;
        tweenDuration?: number;
        confettiSource?: {
            x: number;
            y: number;
            w: number;
            h: number;
        };
        friction?: number;
        gravity?: number;
        wind?: number;
        drawShape?: (ctx: CanvasRenderingContext2D) => void;
        onConfettiComplete?: (confetti?: any) => void;
        className?: string;
    }

    export default class ReactConfetti extends React.Component<ConfettiProps> { }
}
