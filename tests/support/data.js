const standardUser = { username: 'standard_user', password: 'secret_sauce' };

const invalidLogins = [
  { name: 'missing username', username: '', password: 'secret_sauce', error: 'Epic sadface: Username is required' },
  { name: 'missing password', username: 'standard_user', password: '', error: 'Epic sadface: Password is required' },
  { name: 'wrong password', username: 'standard_user', password: 'wrong_password', error: 'Epic sadface: Username and password do not match any user in this service' },
  { name: 'unknown user', username: 'unknown_user', password: 'secret_sauce', error: 'Epic sadface: Username and password do not match any user in this service' },
  { name: 'locked-out user', username: 'locked_out_user', password: 'secret_sauce', error: 'Epic sadface: Sorry, this user has been locked out.' },
];

const catalog = [
  { name: 'Sauce Labs Backpack', price: '$29.99' },
  { name: 'Sauce Labs Bike Light', price: '$9.99' },
  { name: 'Sauce Labs Bolt T-Shirt', price: '$15.99' },
  { name: 'Sauce Labs Fleece Jacket', price: '$49.99' },
  { name: 'Sauce Labs Onesie', price: '$7.99' },
  { name: 'Test.allTheThings() T-Shirt (Red)', price: '$15.99' },
];

const customer = { firstName: 'QA', lastName: 'Tester', postalCode: '12345' };
const missingCustomerFields = [
  { name: 'first name', omitted: 'firstName', error: 'Error: First Name is required' },
  { name: 'last name', omitted: 'lastName', error: 'Error: Last Name is required' },
  { name: 'postal code', omitted: 'postalCode', error: 'Error: Postal Code is required' },
];

module.exports = { standardUser, invalidLogins, catalog, customer, missingCustomerFields };
