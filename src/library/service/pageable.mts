/**
 * Pageable constants and types.
 */
export const DEFAULT_PAGE_SIZE = 5;
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE_NUMBER = 0;

/**
 * Data structure for pageable.
 */
export type Pageable = {
    readonly number: number;
    readonly size: number;
};

/**
 * Data structure for pageable properties.
 */
export type PageableProps = {
    readonly number?: string | undefined;
    readonly size?: string | undefined;
};

/**
 * Constructs a pageable object from the given pageable properties, applying default values and constraints as necessary.
 * @param pageableProps - The pageable properties to construct the pageable object from.
 * @returns A pageable object with validated and defaulted number and size.
 */
export const createPageable = ({ number, size }: PageableProps): Pageable => {
    let numberFloat = Number(number);
    let numberInt: number;
    if (Number.isNaN(numberFloat) || !Number.isInteger(numberFloat)) {
        numberInt = DEFAULT_PAGE_NUMBER;
    } else {
        numberInt = numberFloat - 1;
        if (numberInt < 0) {
            numberInt = DEFAULT_PAGE_NUMBER;
        }
    }

    let sizeFloat = Number(size);
    let sizeInt: number;
    if (Number.isNaN(sizeFloat) || !Number.isInteger(sizeFloat)) {
        sizeInt = DEFAULT_PAGE_SIZE;
    } else {
        sizeInt = sizeFloat;
        if (sizeInt < 1 || sizeInt > MAX_PAGE_SIZE) {
            sizeInt = DEFAULT_PAGE_SIZE;
        }
    }

    return { number: numberInt, size: sizeInt };
};