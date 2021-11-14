const getUserByEmail = (userDB, email) => {
  for (let id in userDB) {
    let user = userDB[id];
    if (email === userDB[id].email) {
      return {data: user, error: null};
    }
  }
  console.log('getUserByEmail', email);
  return {data: null, error: 'Not Valid Login'};
}

module.exports = {getUserByEmail};