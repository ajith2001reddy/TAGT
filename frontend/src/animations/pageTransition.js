export const pageVariants = {
    initial: {
        opacity: 0,
        y: 12,
        filter: "blur(6px)"
    },
    animate: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: {
            duration: 0.35,
            ease: [0.16, 1, 0.3, 1] // Apple-like spring easing
        }
    },
    exit: {
        opacity: 0,
        y: -12,
        filter: "blur(6px)",
        transition: {
            duration: 0.25,
            ease: [0.4, 0, 1, 1]
        }
    }
};
