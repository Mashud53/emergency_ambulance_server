import config from "../../config";
import { getBkashIdToken } from "../../lib/bkash";
import { prisma } from "../../lib/prisma";
import { RequestUser } from "../../middleware/checkAuth";

const callAmbulance = async (JwtPayload: any, user: RequestUser) => {
	const transactionResult = await prisma.$transaction(async (tx) => {

		const emergency = await tx.emergency.create({
			data: {
				callerId: user.userId
			}
		})
		const bkashIdToken = await getBkashIdToken();
		if (!bkashIdToken) {
			throw new Error("No Bkash Access Token Found");
		}
		const bakshCreatePaymentResponse = await fetch(
			`${config.bkash_base_url}/tokenized/checkout/create`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
					Authorization: bkashIdToken,
					"X-App-Key": config.bkash_app_key,
				},
				body: JSON.stringify({
					agreementID: "TokenizedMerchant01L3IKB6H1565072174986",
					mode: "0011",
					payerReference: user.email,
					callbackURL: `${config.bkash_callback_url}/emergency/call-ambulance/payment/callback`,
					merchantAssociationInfo: "MI05MID54RF09123456One",
					amount: "12",
					currency: "BDT",
					intent: "sale",
					merchantInvoiceNumber: emergency.id,
				}),
			},
		);
		const bkashCreatePaymentResult = await bakshCreatePaymentResponse.json();

		// create payment model 
		await tx.payment.create({
			data: {
				merchantInvoiceNumber: bkashCreatePaymentResult.merchantInvoiceNumber,
				emergencyId: emergency.id,
				amount: bkashCreatePaymentResult.amount,
				bkashPaymnetId: bkashCreatePaymentResult.paymentID,
				payerReferench: user.email,
				gateWayResponse: bkashCreatePaymentResult,

			}
		});


		return bkashCreatePaymentResult;

	})
	return transactionResult
};

const callAmbulanceCallback = async (query: Record<string, any>) => {
	const paymentId = query.paymentID;
	if (!paymentId) {
		throw new Error("Payment Id Missing");
	}

	const status = query.status;

	if (!status) {
		throw new Error("Payment status is missing");
	}

	const bkashIdToken = await getBkashIdToken();
	if (!bkashIdToken) {
		throw new Error("No Bkash Access Token Found");
	}

	const executedPaymentResponse = await fetch(
		`${config.bkash_base_url}/tokenized/checkout/execute`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				Authorization: bkashIdToken,
				"X-App-Key": config.bkash_app_key,
			},
			body: JSON.stringify({
				paymentID: paymentId,
			}),
		},
	);
	const executePaymentResult = await executedPaymentResponse.json()
	if (status === "success") {
		return {
			executePaymentResult,
			redirectUrl: `${config.frontend_url}/dashboard/my-ambulance?status=success`
		}
	}
	if (status === "failure") {
		return {
			executePaymentResult,
			redirectUrl: `${config.frontend_url}/dashboard/my-ambulance?status=failure`
		}
	}
	if (status === "cancel") {
		return {
			executePaymentResult,
			redirectUrl: `${config.frontend_url}/dashboard/my-ambulance?status=cancel`
		}
	}
	return {
		executePaymentResult,
		redirectUrl: `${config.frontend_url}/dashboard/my-ambulance`
	}


};

export const EmergencyService = {
	callAmbulance,
	callAmbulanceCallback,
};
