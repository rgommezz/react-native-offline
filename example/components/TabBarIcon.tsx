import React from 'react';
import { Ionicons } from '@expo/vector-icons';

import Colors from '../constants/Colors';

interface Props {
  name: React.ComponentProps<typeof Ionicons>['name'];
  focused: boolean;
  color?: string;
  size?: number;
}

const TabBarIcon: React.FC<Props> = ({
  focused,
  name,
  color,
  size = 26,
}) => (
  <Ionicons
    name={name}
    size={size}
    style={{ marginBottom: -3 }}
    color={color ?? (focused ? Colors.tabIconSelected : Colors.tabIconDefault)}
  />
);

export default TabBarIcon;
