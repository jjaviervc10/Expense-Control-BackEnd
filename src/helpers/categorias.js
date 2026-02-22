// Categorías y palabras clave para clasificación de productos y gastos
export const categorias = {
  'Ahorro': ['ahorro', 'deposito', 'inversion'],
  'Comida': [
    'pollo', 'crema', 'ajo', 'chile', 'tomatillo', 'carne', 'queso', 'verdura', 'fruta', 'pan', 'leche', 'huevo', 'pescado', 'jamon', 'salchicha', 'tortilla', 'yogur', 'mantequilla', 'cebolla', 'jitomate', 'aguacate', 'limon', 'manzana', 'banana', 'pera', 'uva', 'zanahoria', 'papa', 'arroz', 'frijol', 'lenteja', 'azucar', 'sal', 'aceite', 'galleta', 'cereal', 'sopa', 'pasta', 'atún', 'mayonesa', 'ketchup', 'mostaza', 'salsa', 'refresco', 'agua', 'jugo', 'café', 'té', 'bebida', 'botana', 'snack', 'tuna', 'espinaca', 'apio', 'brócoli', 'col', 'lechuga', 'nuez', 'almendra', 'cacahuate', 'miel', 'chocolate', 'galleta', 'helado', 'postre', 'tarta', 'pastel', 'flan', 'natilla', 'pudin', 'sazonador', 'caldo', 'sazon', 'vinagre', 'sazonador', 'condimento', 'especia', 'hierba', 'albahaca', 'oregano', 'cilantro', 'perejil', 'tomillo', 'romero', 'laurel', 'canela', 'clavo', 'anís', 'comino', 'mostaza', 'curcuma', 'paprika', 'pimienta', 'champiñon', 'seta', 'hongos', 'maiz', 'elote', 'granola', 'avena', 'trigo', 'centeno', 'cebada', 'soya', 'tofu', 'tempeh', 'seitan', 'hamburguesa', 'pizza', 'hotdog', 'sandwich', 'taco', 'burrito', 'quesadilla', 'enchilada', 'fajita', 'empanada', 'croqueta', 'nugget', 'alitas', 'costilla', 'filete', 'lomo', 'chuleta', 'milanesa', 'salmon', 'tilapia', 'bacalao', 'sardina', 'marisco', 'camarón', 'pulpo', 'calamar', 'ostión', 'almeja', 'langosta', 'crab', 'cangrejo', 'mejillón', 'caracol', 'ostras', 'pescado', 'atun', 'trucha', 'merluza', 'dorada', 'lubina', 'robaliza', 'corvina', 'pargo', 'pez', 'pechuga',
    // ...existing keywords...
  ],
    'Ropa': [
      'ropa', 'pantalon', 'camisa', 'playera', 'blusa', 'vestido', 'falda', 'short', 'jeans', 'chaqueta', 'abrigo', 'sueter', 'calcetin', 'zapato', 'tenis', 'botas', 'sandalia', 'cinturon', 'accesorio', 'moda', 'gabardina', 'casual', 'formal', 'traje', 'uniforme', 'chaleco', 'bufanda', 'gorra', 'sombrero', 'guante', 'lenceria', 'bikini', 'bañador', 'pijama', 'corbata', 'cinto', 'boy london', 'american', 'ml', 'ea'
    ],
  'Productos': [
    'detergente', 'jabón', 'shampoo', 'limpiador', 'cloro', 'suavizante', 'toalla', 'papel', 'servilleta', 'cepillo', 'pasta dental', 'desodorante', 'pañal', 'trapeador', 'escoba', 'fregona', 'esponja', 'bolsa', 'plato', 'vaso', 'cuchara', 'tenedor', 'cuchillo', 'aluminio', 'plástico', 'envase', 'bote', 'caja', 'cubeta', 'balde', 'taza', 'jarrón', 'botella', 'frasco', 'tarro', 'cucharón', 'colador', 'abrelatas', 'sarten', 'olla', 'cacerola', 'microondas', 'licuadora', 'batidora', 'cafetera', 'tostadora', 'refrigerador', 'congelador', 'lavadora', 'secadora', 'plancha', 'aspiradora', 'ventilador', 'calefactor', 'aire acondicionado', 'televisor', 'radio', 'computadora', 'laptop', 'tablet', 'celular', 'cargador', 'batería', 'pilas', 'foco', 'bombilla', 'lampara', 'cable', 'extensión', 'regulador', 'multicontacto', 'enchufe', 'interruptor', 'fusible', 'disyuntor', 'transformador', 'motor', 'compresor', 'generador', 'herramienta', 'martillo', 'destornillador', 'llave', 'alicate', 'pinza', 'cinta', 'pegamento', 'silicón', 'clavo', 'tornillo', 'tuerca', 'arandela', 'perno', 'remache', 'grapa', 'grapadora', 'taladro', 'broca', 'serrucho', 'sierra', 'caladora', 'lijadora', 'pulidora', 'esmeril', 'cepillo', 'espátula', 'rodillo', 'pincel', 'brocha', 'cubeta', 'balde', 'taza', 'jarrón', 'botella', 'frasco', 'tarro', 'cucharón', 'colador', 'abrelatas', 'sarten', 'olla', 'cacerola'
  ],
  'Casa': ['renta', 'luz', 'agua', 'gas', 'mantenimiento', 'hogar'],
  'Gastos Varios': ['papeleria', 'miscelaneo', 'varios', 'otros'],
  'Ocio': ['cine', 'juego', 'ocio', 'entretenimiento', 'bar'],
  'Salud': ['medicamento', 'farmacia', 'doctor', 'salud', 'consulta'],
  'Suscripciones': ['netflix', 'spotify', 'suscripcion', 'amazon', 'disney']
};

export function clasificarItem(nombre) {
  nombre = nombre.toLowerCase();
  for (const [categoria, keywords] of Object.entries(categorias)) {
    if (keywords.some(k => nombre.includes(k))) {
      return categoria;
    }
  }
  return 'Gastos Varios';
}
