// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

import { Label } from 'office-ui-fabric-react/lib/Label';
import { Pivot, PivotItem } from 'office-ui-fabric-react/lib/Pivot';
import UserList from './UserList';

export default function UserView() {
  return (
    <Pivot aria-label='UserView'>
      <PivotItem headerText='User list'>
        <UserList />
      </PivotItem>
      <PivotItem headerText='Pending list'>
        <Label>Pivot #2</Label>
      </PivotItem>
    </Pivot>
  );
}
