import React from 'react';
import { Badge } from '../../../../components/ui/Badge';

export const UserStatusBadge = ({ isActive }) => {
  return (
    <Badge variant={isActive ? 'success' : 'danger'} size="sm">
      {isActive ? 'Active' : 'Suspended'}
    </Badge>
  );
};

export default UserStatusBadge;
