import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import {
  InterfaceFailureView,
  createInterfaceErrorId,
  reportInterfaceError,
} from './InterfaceFailureView';

type GlobalErrorBoundaryProps = {
  children: ReactNode;
};

type GlobalErrorBoundaryState = {
  hasError: boolean;
  errorId: string | null;
};

export class GlobalErrorBoundary extends Component<GlobalErrorBoundaryProps, GlobalErrorBoundaryState> {
  public state: GlobalErrorBoundaryState = {
    hasError: false,
    errorId: null,
  };

  public static getDerivedStateFromError(): GlobalErrorBoundaryState {
    return {
      hasError: true,
      errorId: createInterfaceErrorId(),
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    reportInterfaceError(error, this.state.errorId, errorInfo.componentStack);
  }

  public render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return <InterfaceFailureView errorId={this.state.errorId} />;
  }
}
