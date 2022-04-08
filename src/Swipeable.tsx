import { animate, motion, PanInfo, useMotionValue } from 'framer-motion';
import React, { ReactElement, ReactNode, useCallback, useEffect, useMemo, useRef } from 'react';
import { SwipeableAction, SWIPEABLE_ACTION_WIDTH } from './SwipeableAction';
import { SwipeableActionButton } from './SwipeableActionButton';
import './swipeable.css';

export type SwipeableActionOptions = {
    color: string;
    text?: ReactNode;
    icon: ReactNode;
    action: () => void;
};

export type Props = {
    /**
     * The left-side actions, ordered from the left to the right.
     */
    leftActions?: Array<SwipeableActionOptions>;

    /**
     * The right-side actions, ordered from left to the right.
     */
    rightActions?: Array<SwipeableActionOptions>;

    /**
     * The content of the Swipeable item.
     */
    children: ReactNode;
};

export const Swipeable = ({
    children,
    leftActions = [],
    rightActions = [],
}: Props): ReactElement => {
    const ref = useRef<HTMLDivElement | null>(null);

    const listItemXOffset = useMotionValue(0);

    const leftThreshold = Math.max(
        window.innerWidth / 2,
        SWIPEABLE_ACTION_WIDTH * leftActions.length
    );

    const rightThreshold = -Math.max(
        window.innerWidth / 2,
        SWIPEABLE_ACTION_WIDTH * rightActions.length
    );

    const close = useCallback(() => {
        animate(listItemXOffset, 0);
    }, [listItemXOffset]);

    function open(side: 'left' | 'right') {
        // eslint-disable-next-line default-case
        switch (side) {
            case 'left':
                animate(listItemXOffset, SWIPEABLE_ACTION_WIDTH * leftActions.length);
                break;
            case 'right':
                animate(listItemXOffset, -SWIPEABLE_ACTION_WIDTH * rightActions.length);
        }
    }

    // Close an opened menu when anything outside it is tapped
    useEffect(() => {
        function closeCallback(event: MouseEvent | TouchEvent) {
            const eventTarget = event.target;

            // @ts-expect-error: Pretty sure that the event target is always a Node.
            if (eventTarget && !ref.current?.contains(eventTarget)) {
                close();
            }
        }

        document.addEventListener('mousedown', closeCallback);
        document.addEventListener('touchstart', closeCallback);

        return () => {
            document.removeEventListener('mousedown', closeCallback);
            document.removeEventListener('touchstart', closeCallback);
        };
    }, [close]);

    // Vibrate when the threshold is passed
    useEffect(
        () =>
            listItemXOffset.onChange((newValue: number) => {
                const previous = listItemXOffset.getPrevious();

                const hasCrossedLeftThreshold =
                    (previous < leftThreshold && newValue >= leftThreshold) ||
                    (previous > leftThreshold && newValue <= leftThreshold);

                const hasCrossedRightThreshold =
                    (previous < rightThreshold && newValue >= rightThreshold) ||
                    (previous > rightThreshold && newValue <= rightThreshold);

                if (hasCrossedLeftThreshold || hasCrossedRightThreshold) {
                    // @ts-expect-error: Check if chayns-API is available, and vibrate if it is.
                    window.chayns?.vibrate([150], 6);
                }
            }),
        [leftThreshold, listItemXOffset, rightThreshold]
    );

    function handlePan(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
        const currentXOffset = listItemXOffset.get();

        if (Math.abs(info.offset.x) > 30 || currentXOffset > 0) {
            listItemXOffset.set(currentXOffset + info.delta.x);
        }
    }

    function handlePanEnd() {
        const offset = listItemXOffset.get();

        if (offset > leftThreshold) {
            leftActions[0]?.action();
            close();
        } else if (offset < rightThreshold) {
            rightActions[rightActions.length - 1]?.action();
            close();
        } else {
            let state: 'left-open' | 'right-open' | 'closed';

            if (offset > 2) {
                state = 'left-open';
            } else if (offset < -2) {
                state = 'right-open';
            } else {
                state = 'closed';
            }

            // eslint-disable-next-line default-case
            switch (state) {
                case 'left-open':
                    if (offset < SWIPEABLE_ACTION_WIDTH) {
                        close();
                    } else {
                        open('left');
                    }
                    break;
                case 'right-open':
                    if (offset > -SWIPEABLE_ACTION_WIDTH) {
                        close();
                    } else {
                        open('right');
                    }
                    break;
                case 'closed':
                    if (offset > SWIPEABLE_ACTION_WIDTH) {
                        open('left');
                    } else if (offset < -SWIPEABLE_ACTION_WIDTH) {
                        open('right');
                    } else {
                        close();
                    }
            }
        }
    }

    const reversedLeftActions = useMemo(() => Array.from(leftActions).reverse(), [leftActions]);

    return (
        <motion.div
            className="swipeable"
            style={{ x: listItemXOffset }}
            onPan={handlePan}
            onPanEnd={handlePanEnd}
            ref={ref}
        >
            {reversedLeftActions.map((action, index) => (
                <SwipeableAction
                    key={index}
                    position="left"
                    backgroundColor={action.color}
                    index={index}
                    totalActions={reversedLeftActions.length}
                    activationThreshold={leftThreshold}
                    listItemXOffset={listItemXOffset}
                >
                    <SwipeableActionButton
                        icon={action.icon}
                        text={action.text}
                        onAction={() => {
                            close();
                            action.action();
                        }}
                    />
                </SwipeableAction>
            ))}
            <div className="swipeable__content">{children}</div>
            {rightActions.map((action, index) => (
                <SwipeableAction
                    key={index}
                    position="right"
                    backgroundColor={action.color}
                    index={index}
                    totalActions={rightActions.length}
                    activationThreshold={rightThreshold}
                    listItemXOffset={listItemXOffset}
                >
                    <SwipeableActionButton
                        icon={action.icon}
                        text={action.text}
                        onAction={() => {
                            close();
                            action.action();
                        }}
                    />
                </SwipeableAction>
            ))}
        </motion.div>
    );
};
