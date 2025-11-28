export const PET_CATEGORIES = [
    { id: '1', name: 'Dogs', icon: 'dog', type: 'material-community' },
    { id: '2', name: 'Cats', icon: 'cat', type: 'material-community' },
    { id: '3', name: 'Cattle', icon: 'cow', type: 'material-community' }, // Ensure you have an icon set that supports this, or use generic
    { id: '4', name: 'Birds', icon: 'bird', type: 'material-community' },
    { id: '5', name: 'Fish', icon: 'fish', type: 'material-community' },
];

export const DIET_PLANS: Record<string, any[]> = {
    'Dogs': [
        { id: 'd1', title: 'Puppy Growth', description: 'High protein for growing pups.', kcal: '400-500 kcal' },
        { id: 'd2', title: 'Adult Maintenance', description: 'Balanced diet for active dogs.', kcal: '900-1200 kcal' },
        { id: 'd3', title: 'Senior Care', description: 'Easy to digest, joint support.', kcal: '600-800 kcal' },
    ],
    'Cats': [
        { id: 'c1', title: 'Indoor Cat', description: 'Low calorie to prevent obesity.', kcal: '180-250 kcal' },
        { id: 'c2', title: 'High Energy', description: 'For active outdoor cats.', kcal: '300-400 kcal' },
    ],
    'Cattle': [
        { id: 'ca1', title: 'Dairy Booster', description: 'Calcium rich fodder mix.', kcal: 'High Energy' },
        { id: 'ca2', title: 'Grazing Plan', description: 'Natural grass rotation schedule.', kcal: 'Moderate' },
    ],
    'Birds': [
        { id: 'b1', title: 'Songbird Mix', description: 'Seeds and dried fruits.', kcal: 'Varies' },
    ],
    'Fish': [
        { id: 'f1', title: 'Tropical Flakes', description: 'Daily nutrition for tank fish.', kcal: 'Low' },
    ]
};