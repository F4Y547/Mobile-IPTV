import React from 'react';
import { View, Text, Pressable } from 'react-native';

type State = {
  hasError: boolean;
  error?: Error;
};

export class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('App crashed:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{
          flex: 1,
          backgroundColor: '#050816',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24
        }}>
          <Text style={{ color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 12 }}>
            SYNTV Online
          </Text>
          <Text style={{ color: '#94A3B8', textAlign: 'center', marginBottom: 20 }}>
            Something went wrong while loading the app.
          </Text>
          <Text style={{ color: '#FCA5A5', textAlign: 'center', marginBottom: 20 }}>
            {this.state.error?.message}
          </Text>
          <Pressable
            onPress={() => {
              this.setState({ hasError: false, error: undefined });
              if (typeof window !== 'undefined') window.location.reload();
            }}
            style={{
              backgroundColor: '#00AEEF',
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: 12
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '700' }}>Reload App</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}
