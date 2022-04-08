import { motion, MotionValue, useSpring, useTransform } from 'framer-motion';
import React, { ReactElement, ReactNode, useEffect } from 'react';
import './swipeableAction.css';

export const SWIPEABLE_ACTION_WIDTH = 72;

interface Props {
    children: ReactNode;
    position: 'left' | 'right';
    backgroundColor?: string;
    index: number;
    totalActions: number;
    listItemXOffset: MotionValue<number>;
    activationThreshold: number;
}

export const SwipeableAction = ({
    children,
    position,
    backgroundColor,
    index,
    totalActions,
    listItemXOffset,
    activationThreshold,
}: Props): ReactElement => {
    /**
     * By default, the action sticks to the content of the swipeable item. This
     * makes it move outwards to reveal the inner items.
     */
    const actionOffset = useTransform(listItemXOffset, (newValue) => {
        const maxOffset = SWIPEABLE_ACTION_WIDTH * index;
        const fractionalOffset = (-newValue / totalActions) * index;

        switch (position) {
            case 'left':
                return Math.max(-maxOffset, fractionalOffset);
            case 'right':
                return Math.min(maxOffset, fractionalOffset);
            default:
                return 0;
        }
    });

    /**
     * Brings the item in again if past the threshold. Only relevant for
     * outermost items.
     */
    const actionOverlayOffset = useSpring(0, {
        bounce: 0,
    }) as MotionValue<number>;

    /**
     * Combines the two values above to create the correct X transform that has
     * to be applied to the action.
     */
    const actionX = useTransform<number, number>([actionOffset, actionOverlayOffset], ([x, y]) => {
        if (position === 'left') {
            return Math.min((x ?? 0) + (y ?? 0), 0);
        }

        return Math.max((x ?? 0) + (y ?? 0), 0);
    });

    // Animate to the middle after passing threshold if outermost item
    useEffect(() => {
        const isOuterMost = index === totalActions - 1;

        if (!isOuterMost) return undefined;

        return listItemXOffset.onChange((newValue) => {
            const lastValue = listItemXOffset.getPrevious();

            // eslint-disable-next-line default-case
            switch (position) {
                case 'left':
                    if (newValue > activationThreshold && lastValue <= activationThreshold) {
                        actionOverlayOffset.set(SWIPEABLE_ACTION_WIDTH * index);
                    } else if (newValue < activationThreshold && lastValue >= activationThreshold) {
                        actionOverlayOffset.set(0);
                    }
                    break;
                case 'right':
                    if (newValue < activationThreshold && lastValue >= activationThreshold) {
                        actionOverlayOffset.set(SWIPEABLE_ACTION_WIDTH * -1 * index);
                    } else if (newValue > activationThreshold && lastValue <= activationThreshold) {
                        actionOverlayOffset.set(0);
                    }
            }
        });
    }, [actionOverlayOffset, activationThreshold, index, listItemXOffset, position, totalActions]);

    const classes = [
        'swipeable-action',
        position === 'left' && 'swipeable-action--left',
        position === 'right' && 'swipeable-action--right',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <motion.div className={classes} style={{ x: actionX, backgroundColor }}>
            {children}
        </motion.div>
    );
};
