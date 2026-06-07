// import React from 'react';
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
//   LineChart,
//   Line,
//   Area,
//   AreaChart
// } from 'recharts';
// import { Card, CardContent, Typography, Box } from '@mui/material';

// // Sample data for charts
// const studentGenderData = [
//   { name: 'Female Students', value: 623, color: '#e91e63' },
//   { name: 'Male Students', value: 624, color: '#3f51b5' }
// ];

// const teacherGenderData = [
//   { name: 'Female Teachers', value: 52, color: '#e91e63' },
//   { name: 'Male Teachers', value: 35, color: '#3f51b5' }
// ];

// const attendanceTrendData = [
//   { day: 'Mon', present: 1180, absent: 67 },
//   { day: 'Tue', present: 1165, absent: 82 },
//   { day: 'Wed', present: 1156, absent: 91 },
//   { day: 'Thu', present: 1172, absent: 75 },
//   { day: 'Fri', present: 1156, absent: 67 },
//   { day: 'Sat', present: 1145, absent: 102 },
//   { day: 'Sun', present: 0, absent: 0 }
// ];

// const monthlyPaymentData = [
//   { month: 'Jan', collected: 850000, pending: 180000 },
//   { month: 'Feb', collected: 920000, pending: 150000 },
//   { month: 'Mar', collected: 880000, pending: 170000 },
//   { month: 'Apr', collected: 950000, pending: 120000 },
//   { month: 'May', collected: 892340, pending: 156780 }
// ];

// const gradeDistributionData = [
//   { grade: 'Grade 1', students: 156 },
//   { grade: 'Grade 2', students: 142 },
//   { grade: 'Grade 3', students: 138 },
//   { grade: 'Grade 4', students: 145 },
//   { grade: 'Grade 5', students: 134 },
//   { grade: 'Grade 6', students: 128 },
//   { grade: 'Grade 7', students: 125 },
//   { grade: 'Grade 8', students: 118 },
//   { grade: 'Grade 9', students: 112 },
//   { grade: 'Grade 10', students: 149 }
// ];

// // Custom tooltip component
// const CustomTooltip = ({ active, payload, label }) => {
//   if (active && payload && payload.length) {
//     return (
//       <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
//         <p className="font-medium">{`${label}`}</p>
//         {payload.map((entry, index) => (
//           <p key={index} style={{ color: entry.color }}>
//             {`${entry.dataKey}: ${entry.value.toLocaleString()}`}
//           </p>
//         ))}
//       </div>
//     );
//   }
//   return null;
// };

// // Student Gender Distribution Chart
// export const StudentGenderChart = () => (
//   <Card className="h-full">
//     <CardContent className="p-6">
//       <Typography variant="h6" className="mb-4">Student Gender Distribution</Typography>
//       <ResponsiveContainer width="100%" height={250}>
//         <PieChart>
//           <Pie
//             data={studentGenderData}
//             cx="50%"
//             cy="50%"
//             innerRadius={60}
//             outerRadius={100}
//             paddingAngle={5}
//             dataKey="value"
//           >
//             {studentGenderData.map((entry, index) => (
//               <Cell key={`cell-${index}`} fill={entry.color} />
//             ))}
//           </Pie>
//           <Tooltip formatter={(value) => [value.toLocaleString(), 'Students']} />
//         </PieChart>
//       </ResponsiveContainer>
//       <Box className="flex justify-center space-x-4 mt-4">
//         {studentGenderData.map((entry, index) => (
//           <Box key={index} className="flex items-center">
//             <div 
//               className="w-3 h-3 rounded-full mr-2" 
//               style={{ backgroundColor: entry.color }}
//             />
//             <Typography variant="body2">{entry.name}: {entry.value}</Typography>
//           </Box>
//         ))}
//       </Box>
//     </CardContent>
//   </Card>
// );

// // Teacher Gender Distribution Chart
// export const TeacherGenderChart = () => (
//   <Card className="h-full">
//     <CardContent className="p-6">
//       <Typography variant="h6" className="mb-4">Teacher Gender Distribution</Typography>
//       <ResponsiveContainer width="100%" height={250}>
//         <PieChart>
//           <Pie
//             data={teacherGenderData}
//             cx="50%"
//             cy="50%"
//             innerRadius={60}
//             outerRadius={100}
//             paddingAngle={5}
//             dataKey="value"
//           >
//             {teacherGenderData.map((entry, index) => (
//               <Cell key={`cell-${index}`} fill={entry.color} />
//             ))}
//           </Pie>
//           <Tooltip formatter={(value) => [value.toLocaleString(), 'Teachers']} />
//         </PieChart>
//       </ResponsiveContainer>
//       <Box className="flex justify-center space-x-4 mt-4">
//         {teacherGenderData.map((entry, index) => (
//           <Box key={index} className="flex items-center">
//             <div 
//               className="w-3 h-3 rounded-full mr-2" 
//               style={{ backgroundColor: entry.color }}
//             />
//             <Typography variant="body2">{entry.name}: {entry.value}</Typography>
//           </Box>
//         ))}
//       </Box>
//     </CardContent>
//   </Card>
// );

// // Weekly Attendance Trend Chart
// export const AttendanceTrendChart = () => (
//   <Card className="h-full">
//     <CardContent className="p-6">
//       <Typography variant="h6" className="mb-4">Weekly Attendance Trend</Typography>
//       <ResponsiveContainer width="100%" height={300}>
//         <AreaChart data={attendanceTrendData}>
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="day" />
//           <YAxis />
//           <Tooltip content={<CustomTooltip />} />
//           <Area 
//             type="monotone" 
//             dataKey="present" 
//             stackId="1" 
//             stroke="#4caf50" 
//             fill="#4caf50" 
//             fillOpacity={0.6}
//           />
//           <Area 
//             type="monotone" 
//             dataKey="absent" 
//             stackId="1" 
//             stroke="#f44336" 
//             fill="#f44336" 
//             fillOpacity={0.6}
//           />
//         </AreaChart>
//       </ResponsiveContainer>
//     </CardContent>
//   </Card>
// );

// // Monthly Payment Trend Chart
// export const PaymentTrendChart = () => (
//   <Card className="h-full">
//     <CardContent className="p-6">
//       <Typography variant="h6" className="mb-4">Monthly Payment Collection Trend</Typography>
//       <ResponsiveContainer width="100%" height={300}>
//         <BarChart data={monthlyPaymentData}>
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="month" />
//           <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
//           <Tooltip 
//             formatter={(value) => [`${value.toLocaleString()}`, '']}
//             content={<CustomTooltip />}
//           />
//           <Bar dataKey="collected" fill="#4caf50" name="Collected" />
//           <Bar dataKey="pending" fill="#ff9800" name="Pending" />
//         </BarChart>
//       </ResponsiveContainer>
//     </CardContent>
//   </Card>
// );

// // Grade-wise Student Distribution Chart
// export const GradeDistributionChart = () => (
//   <Card className="h-full">
//     <CardContent className="p-6">
//       <Typography variant="h6" className="mb-4">Grade-wise Student Distribution</Typography>
//       <ResponsiveContainer width="100%" height={300}>
//         <BarChart data={gradeDistributionData}>
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="grade" />
//           <YAxis />
//           <Tooltip content={<CustomTooltip />} />
//           <Bar dataKey="students" fill="#2196f3" />
//         </BarChart>
//       </ResponsiveContainer>
//     </CardContent>
//   </Card>
// );
