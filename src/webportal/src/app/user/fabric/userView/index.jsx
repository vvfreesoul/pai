// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

import { Pivot, PivotItem } from 'office-ui-fabric-react/lib/Pivot';
import UserList from './UserList';
import UserRequests from './UserRequests/UserRequests';

export default function UserView() {
  return (
    <Pivot aria-label='UserView'>
      <PivotItem headerText='User list'>
        <UserList />
      </PivotItem>
      <PivotItem headerText='Pending list'>
        <UserRequests />
      </PivotItem>
    </Pivot>
  );
}
