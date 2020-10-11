// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useEffect } from 'react';

import { Fabric, Stack, getTheme } from 'office-ui-fabric-react';

import { MaskSpinnerLoading } from '../../../../components/loading';
import MessageBox from '../../components/MessageBox';

import t from '../../../../components/tachyons.scss';

import Context from '../Context';
import UserRequestTable from './UserRequestTable';
import Ordering from '../Ordering';
import Pagination from '../Pagination';
import Paginator from '../Paginator';
import {
  getAllUserRequestsRequest,
  removeUserRequestRequest,
  updateUserRequestStateRequest,
} from '../../conn';

export default function UserRequests() {
  const [loading, setLoading] = useState({ show: false, text: '' });
  const showLoading = text => {
    setLoading({ show: true, text: text });
  };
  const hideLoading = () => {
    setLoading({ show: false });
  };

  const [messageBox, setMessageBox] = useState({
    text: '',
    confirm: false,
    onClose: null,
  });
  const showMessageBox = value => {
    return new Promise((resolve, reject) => {
      setMessageBox({ text: String(value), onClose: resolve });
    });
  };
  const showMessageBoxWithConfirm = value => {
    return new Promise((resolve, reject) => {
      setMessageBox({ text: String(value), onClose: resolve, confirm: true });
    });
  };
  const hideMessageBox = value => {
    const { onClose } = messageBox;
    setMessageBox({ text: '' });
    if (onClose) {
      onClose(value);
    }
  };

  const [allUserRequests, setAllUserRequests] = useState([]);
  const refreshAllUserRequests = () => {
    setAllUserRequests([]);
    getAllUserRequestsRequest()
      .then(data => {
        setAllUserRequests(data);
      })
      .catch(err => {
        showMessageBox(err).then(() => {
          window.location.href = '/';
        });
      });
  };
  useEffect(refreshAllUserRequests, []);

  const [pagination, setPagination] = useState(new Pagination());
  useEffect(() => {
    setPagination(new Pagination(pagination.itemsPerPage, 0));
  }, [allUserRequests]);

  const [selectedRequests, setSelectedRequests] = useState([]);
  const [allSelected, setAllSelected] = useState(false);
  const getSelectedRequests = () => {
    if (allSelected) {
      return pagination.apply(ordering.apply(allUserRequests || []));
    } else {
      return selectedRequests;
    }
  };

  const [ordering, setOrdering] = useState(new Ordering());

  const removeUserRequests = () => {
    const selected = getSelectedRequests();
    showMessageBoxWithConfirm(
      `Are you sure to remove ${
        selected.length === 1 ? 'the request' : 'these requests'
      }?`,
    ).then(confirmed => {
      if (confirmed) {
        showLoading('Processing...');
        Promise.all(
          selected.map(request =>
            removeUserRequestRequest(request.id).catch(err => err),
          ),
        ).then(results => {
          hideLoading();
          const errors = results.filter(result => result instanceof Error);
          let message = `Remove ${
            selected.length === 1 ? 'request' : 'requests'
          } `;
          if (errors.length === 0) {
            message += 'successfully.';
          } else {
            message += `with ${errors.length} failed.`;
            errors.forEach(error => {
              message += `\n${String(error)}`;
            });
          }
          setTimeout(() => {
            showMessageBox(message).then(() => {
              refreshAllUserRequests();
            });
          }, 100);
        });
      }
    });
  };

  const context = {
    filteredUsers: allUserRequests,
    allUserRequests,
    refreshAllUserRequests,
    ordering,
    setOrdering,
    pagination,
    setPagination,
    selectedRequests,
    setSelectedRequests,
    getSelectedRequests,
    setAllSelected,
    removeUserRequests,
    updateUserRequestStateRequest,
    showMessageBox,
  };

  const { spacing } = getTheme();

  return (
    <Context.Provider value={context}>
      <Fabric className={t.h100}>
        <Stack
          verticalFill
          styles={{
            root: [
              t.relative,
              { padding: `${spacing.s1} ${spacing.l1} ${spacing.l1}` },
            ],
          }}
        >
          <Stack.Item>
            <div style={{ height: spacing.s1 }}></div>
          </Stack.Item>
          <Stack.Item
            grow
            styles={{
              root: [
                t.overflowAuto,
                t.bgWhite,
                { height: '100%', padding: spacing.l1 },
              ],
            }}
          >
            <UserRequestTable />
          </Stack.Item>
          <Stack.Item
            styles={{ root: [t.bgWhite, { paddingBottom: spacing.l1 }] }}
          >
            <Paginator />
          </Stack.Item>
        </Stack>
      </Fabric>
      {loading.show && <MaskSpinnerLoading label={loading.text} />}
      {messageBox.text && (
        <MessageBox
          text={messageBox.text}
          onDismiss={hideMessageBox}
          confirm={messageBox.confirm}
        />
      )}
    </Context.Provider>
  );
}
