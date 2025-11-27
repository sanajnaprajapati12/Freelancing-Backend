// utils/profileCompletion.js
export const calculateProfileCompletion = (user) => {
  // Convert Mongoose document to plain object if needed
  const u = user.toObject ? user.toObject() : user;

  let completed = 0;

  // Step 1 fields
  if (u.fullname) completed += 1;
  if (u.email) completed += 1;
  if (u.password) completed += 1;
  if (u.mobile) completed += 1;

  // Step 2 fields
  if (u.city) completed += 1;
  if (u.state) completed += 1;
  if (u.bio) completed += 1;
  if (u.dob) completed += 1;
  if (u.currentDesignation) completed += 1;
  if (u.profilePhoto) completed += 1;

  const totalFields = 10; // 4 Step1 + 6 Step2

  return Math.round((completed / totalFields) * 100);
};
