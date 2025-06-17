export default [
    {
        'path': '/',
        'title': (type) => `Home ${type} | Dicoding Story`,
        'file': import('../pages/home'),
    },
    {
        'path': '/login',
        'title': 'Login | Dicoding Story',
        'file': import('../pages/login'),
    },
    {
        'path': '/register',
        'title': 'Register | Dicoding Story',
        'file': import('../pages/register'),
    },
    {
        'path': '/tambah',
        'title': 'Tambah Post | Dicoding Story',
        'file': import('../pages/tambah'),
    },
    {
        'path': '/saved',
        'title': 'Saved Stories | Dicoding Story',
        'file': import('../pages/saved'),
    },
    {
        'path': '/details/:id',
        'title': 'Detail Post | Dicoding Story',
        'file': import('../pages/detail'),
    },
];