import React, { PropsWithChildren } from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';

type Props = PropsWithChildren<{ style?: StyleProp<TextStyle> }>;

export const MonoText: React.FC<Props> = ({ style, children, ...rest }) => (
  <Text {...rest} style={[style, { fontFamily: 'space-mono' }]}>
    {children}
  </Text>
);
