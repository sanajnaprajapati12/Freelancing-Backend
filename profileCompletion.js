const calculateProfileCompletion = (user) => {
  let completion = 0;

  if (user.fullname) completion += 10;
  if (user.email) completion += 10;
  if (user.password) completion += 10;
  if (user.mobile) completion += 20;
  if (user.city) completion += 10;
  if (user.state) completion += 10;
  if (user.bio) completion += 10;
  if (user.dob) completion += 10;
  if (user.currentDesignation) completion += 10;
  if (user.role) completion += 5;
  if (user.profilePhoto) completion += 5;

  // Cap at 100
  if (completion > 100) completion = 100;

  return completion;
};
export default calculateProfileCompletion