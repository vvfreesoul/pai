// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useContext, useMemo } from 'react';

import {
  ShimmeredDetailsList,
  Selection,
  FontClassNames,
  ColumnActionsMode,
  DefaultButton,
  mergeStyles,
  TooltipHost,
} from 'office-ui-fabric-react';

import c from 'classnames';
import t from '../../../../components/tachyons.scss';

import Context from '../Context';
import Ordering from '../Ordering';

export default function Table() {
  const {
    allUserRequests,
    ordering,
    setOrdering,
    pagination,
    setSelectedRequests,
    setAllSelected,
    getSelectedRequests,
    updateUserRequestStateRequest,
    refreshAllUserRequests,
  } = useContext(Context);

  /**
   * @type {import('office-ui-fabric-react').Selection}
   */
  const selection = useMemo(() => {
    return new Selection({
      onSelectionChanged() {
        setSelectedRequests(selection.getSelection());
        setAllSelected(selection.isAllSelected());
      },
    });
  }, []);

  /**
   * @param {React.MouseEvent<HTMLElement>} event
   * @param {import('office-ui-fabric-react').IColumn} column
   */
  function onColumnClick(event, column) {
    const { field, descending } = ordering;
    if (field === column.key) {
      if (descending) {
        setOrdering(new Ordering());
      } else {
        setOrdering(new Ordering(field, true));
      }
    } else {
      setOrdering(new Ordering(column.key));
    }
  }

  /**
   * @param {import('office-ui-fabric-react').IColumn} column
   */
  function applySortProps(column) {
    column.isSorted = ordering.field === column.key;
    column.isSortedDescending = ordering.descending;
    column.onColumnClick = onColumnClick;
    return column;
  }

  /**
   * @type {import('office-ui-fabric-react').IColumn}
   */
  const usernameColumn = applySortProps({
    key: 'username',
    minWidth: 100,
    name: 'User Name',
    fieldName: 'username',
    className: FontClassNames.mediumPlus,
    headerClassName: FontClassNames.medium,
    isResizable: true,
    onRender(request) {
      return request.user.username;
    },
  });

  const adminColumn = applySortProps({
    key: 'requestTime',
    minWidth: 150,
    name: 'Request Time',
    className: FontClassNames.mediumPlus,
    headerClassName: FontClassNames.medium,
    isResizable: true,
    onRender(request) {
      const date = new Date(request.requestTime);
      return date.toISOString().split('T')[0];
    },
  });

  const descriptionColumn = applySortProps({
    key: 'description',
    minWidth: 250,
    name: 'Description',
    className: FontClassNames.mediumPlus,
    headerClassName: FontClassNames.medium,
    isResizable: true,
    onRender(request) {
      return request.message;
    },
  });

  const stateColumn = applySortProps({
    key: 'state',
    minWidth: 100,
    name: 'State',
    className: FontClassNames.mediumPlus,
    headerClassName: FontClassNames.medium,
    isResizable: true,
    onRender(request) {
      return request.state;
    },
  });

  /**
   * actions column
   * @type {import('office-ui-fabric-react').IColumn}
   */
  const actionsColumn = {
    key: 'actions',
    minWidth: 200,
    name: 'Actions',
    headerClassName: FontClassNames.medium,
    columnActionsMode: ColumnActionsMode.disabled,
    className: mergeStyles({
      paddingTop: '0px !important',
      paddingBottom: '0px !important',
      display: 'flex !important',
    }),
    onRender(request) {
      /**
       * @param {React.MouseEvent} event
       */
      function onApprove(event) {
        event.stopPropagation();
        updateUserRequestStateRequest(request.id, 'approved').then(
          refreshAllUserRequests,
        );
      }

      function onReject(event) {
        event.stopPropagation();
        updateUserRequestStateRequest(request.id, 'rejected').then(
          refreshAllUserRequests,
        );
      }

      const disabled = getSelectedRequests().length > 1;
      const disabledTip = disabled
        ? 'Multi-request simultaneous action is not supported'
        : '';

      return (
        <div className={c([t.itemsCenter, t.flex])} data-selection-disabled>
          <TooltipHost content={disabledTip}>
            <DefaultButton
              disabled={disabled}
              onClick={onApprove}
              styles={{
                root: { backgroundColor: '#e5e5e5', 'margin-right': '10px' },
                rootFocused: { backgroundColor: '#e5e5e5' },
                rootDisabled: { backgroundColor: '#eeeeee' },
                rootCheckedDisabled: { backgroundColor: '#eeeeee' },
              }}
            >
              Approve
            </DefaultButton>
            <DefaultButton
              disabled={disabled}
              onClick={onReject}
              styles={{
                root: { backgroundColor: '#e5e5e5' },
                rootFocused: { backgroundColor: '#e5e5e5' },
                rootDisabled: { backgroundColor: '#eeeeee' },
                rootCheckedDisabled: { backgroundColor: '#eeeeee' },
              }}
            >
              Reject
            </DefaultButton>
          </TooltipHost>
        </div>
      );
    },
  };

  const columns = [
    usernameColumn,
    adminColumn,
    descriptionColumn,
    stateColumn,
    actionsColumn,
  ];

  return (
    <ShimmeredDetailsList
      items={pagination.apply(ordering.apply(allUserRequests || []))}
      setKey='key'
      columns={columns}
      enableShimmer={allUserRequests === null || allUserRequests.length === 0}
      shimmerLines={pagination.itemsPerPage}
      selection={selection}
    />
  );
}
