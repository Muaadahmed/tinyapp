const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail(testUsers, "user@example.com");
    const { data } = user;
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert.deepEqual(data.id, expectedUserID);
  });

  it('should return null with an invalid email', function() {
    const user = getUserByEmail(testUsers, "user3@example.com");
    const { data, error } = user;
    const expectedUserID = null;
    // Write your assert statement here
    assert.deepEqual(data, expectedUserID);
  });
});