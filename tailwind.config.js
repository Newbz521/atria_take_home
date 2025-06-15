/** @type {import('tailwindcss').Config} */
export default {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
      extend: {
        darkMode: 'class',
        
            screens: {
              'phone-landscape': { 'raw': '(max-width: 768px) and (orientation: landscape)' },
            },
            boxShadow: {
                'inner-subtle': 'inset 0 0 100px rgba(0, 0, 0, 0.2)',
            },
            colors: {
                "custom-dark-blue": "#152c44",
                "custom-teal-blue": "#02485a",
                "custom-red": "#db5365",
                "custom-pink": "#d5a29d",
                "custom-light-blue": "#26e5d3",
                "custom-orange": "#fd7757",
                "custom-title": "#808eed"
            },
            animation: {
              wave: 'wave 1.5s ease-in-out infinite ',
              bounce: 'bounce 5s ease-in-out infinite'
            },
        keyframes: {
          bounce: {
            "0%, 100%": {transform: "translateY(0)"},
            "50%": {transform: "translateY(-15px)"}
          },
          wave: {
            "0%": {transform: "rotate(0deg) translateY(-90%)", transformOrigin: "bottom left"},
            "50%": {transform: "rotate(5deg) translateY(-90%)", transformOrigin: "bottom left"},
            "100%": {transform: "rotate(0deg) translateY(-90%)", transformOrigin: "bottom left"},
          },
              
            },
        },
    },
    plugins: [],
};

// .backdrop{
//   transform: translateZ(-17.5px) scale(3.5);
// }
// .background {
//   transform: translateZ(-15px) scale(4);
// }
// .midground{
//   transform: translateZ(-12.5px) scale(4.5);
// }
// .foreground {
//   transform: translateZ(-10px) scale(5);
// }
// .frontground {
//   transform: translateZ(-7.5px) scale(5.5);
// }