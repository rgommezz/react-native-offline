import React, { FunctionComponent } from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';

type Props = { style?: StyleProp<TextStyle> };
export const MonoText: FunctionComponent<Props> = props => (
  <Text {...props} style={[props.style, { fontFamily: 'space-mono' }]} />
);
