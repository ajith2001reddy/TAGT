import { buildPropertyFilter } from './src/utils/tenantScope.js';
import mongoose from 'mongoose';

const mockUser = {
    _id: new mongoose.Types.ObjectId(),
    role: 'owner',
    propertyIds: [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()]
};

const scope = buildPropertyFilter(mockUser);
console.log('Scope for owner:', JSON.stringify(scope));

const pm = scope.propertyId ? { propertyId: scope.propertyId } : {};
console.log('Final pm filter:', JSON.stringify(pm));

if (pm.propertyId && pm.propertyId.$in) {
    console.log('SUCCESS: pm.propertyId.$in is defined');
} else {
    console.log('FAILURE: pm.propertyId.$in is NOT defined');
    console.log('pm.propertyId is:', typeof pm.propertyId);
}
