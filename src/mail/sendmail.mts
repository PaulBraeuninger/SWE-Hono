/**
 * This module provides the asynchronous {@linkcode sendmail} function for
 * sending emails.
 * @packageDocumentation
 */

import { type SendMailOptions, createTransport } from 'nodemailer';
import { mailConfig } from '../config/mail.mts';
import { getLogger } from '../logger/logger.mts';

/** Type definition for sending an email. */
export type SendMailParams = {
    /** Email subject. */
    readonly subject: string;
    /** Email body. */
    readonly body: string;
};

const logger = getLogger('sendmail', 'func');

const { activated, from, to } = mailConfig;
/**
 * Asynchronously send an email with subject and content.
 * @param subject Subject as a string.
 * @param body Content as a string.
 * @returns Promise resolving to void
 */
export const sendmail = async ({ subject, body }: SendMailParams) => {
    if (!activated) {
        logger.warn('Mail deaktiviert');
        return;
    }

    const mailOptions: SendMailOptions = { from, to, subject, html: body };
    logger.debug('mailOptions=%o', mailOptions);

    try {
        await createTransport(mailConfig.options).sendMail(mailOptions); // NOSONAR
    } catch (err) {
        logger.warn('Fehler %o', err as object);
    }
};
