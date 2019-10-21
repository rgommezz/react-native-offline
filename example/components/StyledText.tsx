import React, { FunctionComponent } from 'react';
import { Text, TextStyle } from 'react-native';

type Props = { style?: TextStyle };
export const MonoText: FunctionComponent<Props> = props => (
  <Text {...props} style={[props.style, { fontFamily: 'space-mono' }]} />
);
