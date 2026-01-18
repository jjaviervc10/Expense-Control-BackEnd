const { verifyToken } = require('../../middlewares/verifyToken');

test('should validate token correctly', () => {
	const req = { headers: { authorization: 'Bearer validToken' } };
	const res = {};
	const next = jest.fn();

	verifyToken(req, res, next);
	expect(next).toHaveBeenCalled();
});

test('should return 401 for invalid token', () => {
	const req = { headers: { authorization: 'Bearer invalidToken' } };
	const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
	const next = jest.fn();

	verifyToken(req, res, next);
	expect(res.status).toHaveBeenCalledWith(401);
	expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
});