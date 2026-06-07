import { InitService } from '../services/init.service';

jest.mock('../lib/prisma', () => require('./__mocks__/prisma.mock').default);
import prismaMock from './__mocks__/prisma.mock';

jest.mock('../lib/password', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashed_password'),
}));

describe('Init Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes the system by creating defaults if they do not exist', async () => {
    // Mock everything as not existing to trigger creations
    (prismaMock.organization.findFirst as jest.Mock).mockResolvedValue(null);
    (prismaMock.organization.create as jest.Mock).mockResolvedValue({ id: 'org-1' });

    (prismaMock.branch.findFirst as jest.Mock).mockResolvedValue(null);
    (prismaMock.branch.create as jest.Mock).mockResolvedValue({ id: 'branch-1' });

    (prismaMock.role.findFirst as jest.Mock)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValue({ id: 'role-superadmin' });
    (prismaMock.role.create as jest.Mock).mockResolvedValue({ id: 'role-1' });

    (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prismaMock.user.create as jest.Mock).mockResolvedValue({ id: 'user-1' });

    (prismaMock.fiscalYear.findFirst as jest.Mock).mockResolvedValue(null);
    (prismaMock.fiscalYear.create as jest.Mock).mockResolvedValue({ id: 'fy-1' });

    await InitService.initializeSystem();

    expect(prismaMock.organization.create).toHaveBeenCalled();
    expect(prismaMock.branch.create).toHaveBeenCalled();
    // 6 core roles
    expect(prismaMock.role.create).toHaveBeenCalledTimes(6);
    expect(prismaMock.user.create).toHaveBeenCalled();
    expect(prismaMock.fiscalYear.create).toHaveBeenCalled();
  });

  it('skips creation if defaults already exist', async () => {
    (prismaMock.organization.findFirst as jest.Mock).mockResolvedValue({ id: 'org-1' });
    (prismaMock.branch.findFirst as jest.Mock).mockResolvedValue({ id: 'branch-1' });
    (prismaMock.role.findFirst as jest.Mock).mockResolvedValue({ id: 'role-1' });
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user-1' });
    (prismaMock.fiscalYear.findFirst as jest.Mock).mockResolvedValue({ id: 'fy-1' });

    await InitService.initializeSystem();

    expect(prismaMock.organization.create).not.toHaveBeenCalled();
    expect(prismaMock.branch.create).not.toHaveBeenCalled();
    expect(prismaMock.role.create).not.toHaveBeenCalled();
    expect(prismaMock.user.create).not.toHaveBeenCalled();
    expect(prismaMock.fiscalYear.create).not.toHaveBeenCalled();
  });
});
