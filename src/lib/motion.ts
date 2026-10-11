export const MOTION = {
    arrive: {
        dur: 0.45,
        ink: [0, 0.6],
        halo: [0.2, 0.5],
        grid: [0.4, 0.5],
        sig: 0.95,
        total: 1.4,
    },
    idle: { period: 6, area: 0.12, wavelengths: 1.25 },
    breath: { period: 3, swell: 0.18, ringScale: 3.2 },
    lens: {
        gain: 0.7,
        sigmaPx: { masthead: 60, compact: 13 },
        inMs: 140,
        outMs: 380,
        gridReach: 0.26,
    },
} as const;
