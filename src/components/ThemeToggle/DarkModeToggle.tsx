// import { useEffect, useState } from 'react';
// import ReactSwitch from 'react-switch';

// const DarkModeToggle = () => {
//   const [isDarkMode, setIsDarkMode] = useState(false);

//   useEffect(() => {
//     const savedTheme = localStorage.getItem('theme');
//     if (savedTheme) {
//       document.documentElement.setAttribute('data-theme', savedTheme);
//       setIsDarkMode(savedTheme === 'dark');
//     }
//   }, []);

//   const toggleTheme = (checked) => {
//     const newTheme = checked ? 'dark' : 'light';
//     document.documentElement.setAttribute('data-theme', newTheme);
//     localStorage.setItem('theme', newTheme);
//     setIsDarkMode(checked);
//   };

//   return (
//     <div className="d-flex align-items-center ms-0">
//       <div className="form-check form-switch">
//         <div className="row" style={{justifyContent: "center", alignItems: "center", marginTop: 8}}>
//           <div className="col-auto">
//             <ReactSwitch
//               checked={isDarkMode}
//               onChange={toggleTheme}
//               offColor="#ccc"
//               onColor="#2c3e50"
//               offHandleColor="#fff"
//               onHandleColor="#fff"
//               height={20}
//               width={40}
//               uncheckedIcon={null}
//               checkedIcon={null}
//               handleDiameter={18}
//               className="me-0"
//             />
//           </div>
//           <div className="col-auto" style={{marginBottom: 5}}>
//             <span className={`fs-4 ${isDarkMode ? 'text-light' : 'text-dark'}`}>
//               {isDarkMode ? '🌙' : '🌞'}
//             </span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DarkModeToggle;