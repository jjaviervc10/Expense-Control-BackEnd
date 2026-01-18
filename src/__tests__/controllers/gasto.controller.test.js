const { calcularGasto } = require('../../app');

describe('Pruebas del controlador de gasto', () => {
	test('debería calcular el gasto correctamente', () => {
		const resultado = calcularGasto(100, 20);
		expect(resultado).toBe(80);
	});
});