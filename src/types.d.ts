declare module 'kalidokit' {
    export const Face: {
        solve: (landmarks: any, options?: any) => any;
    };
    export const Pose: {
        solve: (landmarks: any, landmarks3d: any, options?: any) => any;
    };
    export const Hand: {
        solve: (landmarks: any, side: "Right" | "Left") => any;
    };
}
