const { get_roles } = require('./dist/controller/role.controller.js');

async function main() {
  const req = {
    user: {
      id: 'mock',
      organizationId: '20cde46a-4657-4815-832c-bdfc4e7ee189',
      role_name: 'SUPERADMIN' // The logged-in user is an admin
    }
  };
  const res = {
    status: (s) => ({
      json: (data) => console.log(JSON.stringify(data.data.map(r => r.name), null, 2))
    })
  };
  await get_roles(req, res, console.error);
}
main();
